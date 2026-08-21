import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import health, auth, listings, leads, favorites, alerts
from .database import Base, engine
from .scheduler import start_scheduler

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Automatically create database tables (useful for SQLite local development)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Estateline API",
    description="Backend API foundation for the Estateline real estate portal",
    version="0.1.0"
)

@app.on_event("startup")
def on_startup():
    start_scheduler()

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(leads.router)
app.include_router(leads.mine_router)
app.include_router(favorites.router)
app.include_router(alerts.router)

@app.get("/")
def read_root():
    return {
        "message": "Estateline API is running.",
        "docs_url": "/docs",
        "health_check_url": "/health"
    }
