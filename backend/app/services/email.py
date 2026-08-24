import os
import smtplib
import json
import urllib.request
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("estateline.email")

def send_otp_email(email: str, otp_code: str, purpose: str = "Account Verification") -> bool:
    """
    Sends an OTP verification email to the user.
    Prints high-contrast console banner for local terminal debugging.
    First tries direct Gmail SMTP for instant inbox delivery, then falls back to Brevo API.
    """
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "").replace(" ", "")
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "noreply@estateline.com")

    brevo_api_key = os.getenv("BREVO_API_KEY", "")
    if not brevo_api_key and smtp_password.startswith("xkeysib-"):
        brevo_api_key = smtp_password

    banner = f"""
================================================================================
  [ESTATELINE SECURITY SERVICE] {purpose.upper()}
--------------------------------------------------------------------------------
  RECIPIENT : {email}
  VERIFICATION CODE (OTP) : >>>  {otp_code}  <<<
  EXPIRES IN : 10 Minutes
================================================================================
"""
    print(banner, flush=True)

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #DAD5C8; border-radius: 12px; background-color: #FFFFFF;">
      <h2 style="color: #16231C; margin-top: 0; font-size: 22px;">Estateline Security</h2>
      <p style="font-size: 14px; color: #4B564E; margin-bottom: 20px;">Your 6-digit security verification code for <strong>{purpose}</strong> is:</p>
      <div style="background-color: #F6F4EF; border: 1px solid #B8862E; text-align: center; padding: 18px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #B8862E; margin: 20px 0;">
        {otp_code}
      </div>
      <p style="font-size: 12px; color: #888888; margin-top: 20px;">This code will expire in 10 minutes. If you did not request this account verification, please ignore this email.</p>
    </div>
    """

    # 1. Try Direct Gmail SMTP first (Instant Inbox Delivery)
    if smtp_host and smtp_user and smtp_password and not smtp_password.startswith("xkeysib-"):
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"[{otp_code}] Your Estateline Security OTP"
            msg["From"] = f"Estateline Security <{smtp_from}>"
            msg["To"] = email

            text_body = f"Hello,\n\nYour Estateline 6-digit security verification code for {purpose} is: {otp_code}\n\nThis code expires in 10 minutes.\n\nThank you,\nEstateline Team"
            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=5) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(smtp_from, [email], msg.as_string())
            
            logger.info(f"Successfully sent real Gmail SMTP email to {email}")
            print(f"[SMTP SUCCESS] Real instant email sent to {email} via Gmail SMTP", flush=True)
            return True
        except Exception as e:
            logger.error(f"Failed to send SMTP email to {email}: {e}")
            print(f"[SMTP NOTICE] Gmail SMTP failed ({e}), trying Brevo API...", flush=True)

    # 2. Try Brevo REST API fallback
    if brevo_api_key:
        try:
            payload = {
                "sender": {"name": "Estateline Security", "email": smtp_from if "@" in smtp_from else "noreply@estateline.com"},
                "to": [{"email": email}],
                "subject": f"[{otp_code}] Your Estateline Security OTP",
                "htmlContent": html_body
            }

            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "accept": "application/json",
                    "api-key": brevo_api_key,
                    "content-type": "application/json"
                }
            )
            with urllib.request.urlopen(req) as resp:
                if resp.status in [200, 201, 202]:
                    logger.info(f"Successfully sent Brevo API email to {email}")
                    print(f"[BREVO SUCCESS] Real HTML OTP email sent to {email}", flush=True)
                    return True
        except Exception as e:
            logger.error(f"Failed to send Brevo API email to {email}: {e}")
            print(f"[BREVO NOTICE] Brevo API failed: {e}", flush=True)

    return True
