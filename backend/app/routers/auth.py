import os
import secrets
import random
import datetime
import threading
import jwt
import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Agent
from ..schemas import UserRegister, UserLogin, UserResponse, VerifyOTPRequest, ResendOTPRequest, AuthStepResponse
from ..services.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "estateline_super_secret_architectural_key_2026")
JWT_ALGORITHM = "HS256"
COOKIE_NAME = "access_token"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def generate_6digit_otp() -> str:
    """
    Generates a cryptographically strong, high-entropy, unique 6-digit OTP.
    Avoids trivial or predictable repeating patterns (e.g. 111111, 123456, etc.).
    """
    trivial_patterns = {
        "123456", "654321", "111111", "222222", "333333", "444444", 
        "555555", "666666", "777777", "888888", "999999", "000000",
        "121212", "123123", "012345", "543210", "112233", "332211",
        "234567", "765432", "345678", "876543", "456789", "987654"
    }
    while True:
        code = str(secrets.randbelow(900000) + 100000)
        # Require at least 5 unique digits for maximum entropy and authenticity
        if len(set(code)) >= 5 and code not in trivial_patterns:
            return code

# Dependency to get current user from cookie
def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE_NAME)
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Missing session token.",
        )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials.",
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid.",
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )
    return user

# Optional user dependency (returns None instead of throwing 401 for guests)
def get_optional_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            return None
        return db.query(User).filter(User.email == email).first()
    except Exception:
        return None

# Dependency to get current agent
def get_current_agent(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "agent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Only authorized real estate agents are permitted.",
        )
    return current_user


import re

FAKE_DOMAINS = {
    "fake.com", "test.com", "example.com", "dummy.com", "asdf.com",
    "tempmail.com", "mailinator.com", "invalid.com", "sample.com",
    "temp.com", "10minutemail.com", "dispostable.com", "guerrillamail.com", "trashmail.com"
}

def validate_email_address(email: str) -> str:
    email_clean = email.strip().lower()
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email_clean):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format. Please enter a valid email address (e.g. name@gmail.com).",
        )
    parts = email_clean.split("@")
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address.",
        )
    domain = parts[1]
    if domain in FAKE_DOMAINS or len(parts[0]) < 2 or "." not in domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid, active email address (e.g. Gmail, Yahoo, Outlook, etc.).",
        )
    return email_clean

@router.post("/register", response_model=AuthStepResponse)
def register(user_data: UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email_clean = validate_email_address(user_data.email)
    existing_user = db.query(User).filter(User.email == email_clean).first()
    
    if existing_user:
        if existing_user.is_verified:
            return AuthStepResponse(
                message="An account with this email address already exists. Redirecting to Login...",
                email=existing_user.email,
                requires_otp=False,
                already_exists=True
            )
        else:
            # Re-send verification OTP for existing unverified user
            otp = generate_6digit_otp()
            existing_user.otp_code = otp
            existing_user.otp_expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
            existing_user.hashed_password = hash_password(user_data.password)
            existing_user.full_name = user_data.full_name.strip()
            existing_user.role = user_data.role
            
            # Ensure agent profile exists if role is agent
            if existing_user.role == "agent":
                agent_exists = db.query(Agent).filter(Agent.user_id == existing_user.id).first()
                if not agent_exists:
                    new_agent = Agent(
                        user_id=existing_user.id,
                        role_title="Licensed Real Estate Agent at Estateline",
                        bio="A professional agent ready to help you find your dream home."
                    )
                    db.add(new_agent)
            
            db.commit()

            threading.Thread(target=send_otp_email, args=(existing_user.email, otp, "Registration Verification"), daemon=True).start()

            return AuthStepResponse(
                message=f"Account registration pending verification. A dynamic 6-digit security OTP has been instantly sent to {existing_user.email}.",
                email=existing_user.email,
                requires_otp=True
            )

    if user_data.role not in ["buyer", "agent"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'buyer' or 'agent'.",
        )

    hashed_pw = hash_password(user_data.password)
    otp = generate_6digit_otp()
    
    # Create user as unverified
    new_user = User(
        email=email_clean,
        hashed_password=hashed_pw,
        role=user_data.role,
        full_name=user_data.full_name.strip(),
        is_verified=False,
        otp_code=otp,
        otp_expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If role is agent, also create Agent row
    if new_user.role == "agent":
        agent_exists = db.query(Agent).filter(Agent.user_id == new_user.id).first()
        if not agent_exists:
            new_agent = Agent(
                user_id=new_user.id,
                role_title="Licensed Real Estate Agent at Estateline",
                bio="A professional agent ready to help you find your dream home."
            )
            db.add(new_agent)
            db.commit()

    # Send verification email with OTP in background thread (instant socket dispatch)
    threading.Thread(target=send_otp_email, args=(new_user.email, otp, "Registration Verification"), daemon=True).start()

    return AuthStepResponse(
        message=f"Registration successful! A dynamic 6-digit security OTP code has been sent to {new_user.email}.",
        email=new_user.email,
        requires_otp=True
    )


@router.post("/verify-registration-otp", response_model=UserResponse)
def verify_registration_otp(req: VerifyOTPRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please register first.",
        )

    if not user.otp_code or user.otp_code != req.otp_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit OTP verification code.",
        )

    if user.otp_expires_at and datetime.datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP verification code has expired. Please request a new code.",
        )

    # Mark user as verified & clear OTP (Do NOT auto-login, require manual login)
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)

    return user


@router.post("/login")
def login(login_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is not verified yet. Please register or verify your account with the OTP sent to your email.",
        )

    token_data = {"sub": user.email, "role": user.role}
    token = create_access_token(token_data)

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 3600,
        expires=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=False,
        path="/"
    )

    return {
        "status": "success",
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@router.post("/login-verify-otp")
def login_verify_otp(req: VerifyOTPRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    if not user.otp_code or user.otp_code != req.otp_code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 6-digit security OTP code.",
        )

    if user.otp_expires_at and datetime.datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security OTP has expired. Please request a new code.",
        )

    # Clear OTP & log in user
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    token_data = {"sub": user.email, "role": user.role}
    token = create_access_token(token_data)

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 3600,
        expires=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=False,
        path="/"
    )

    return {
        "status": "success",
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role
        }
    }


@router.post("/resend-otp", response_model=AuthStepResponse)
def resend_otp(req: ResendOTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account associated with this email address.",
        )

    otp = generate_6digit_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
    db.commit()

    purpose = "Account Verification" if not user.is_verified else "Login Authentication"
    threading.Thread(target=send_otp_email, args=(user.email, otp, purpose), daemon=True).start()

    return AuthStepResponse(
        message=f"A new dynamic 6-digit OTP code has been instantly sent to {user.email}.",
        email=user.email,
        requires_otp=True
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        samesite="lax",
        httponly=True
    )
    return {"status": "success", "message": "Successfully logged out."}
