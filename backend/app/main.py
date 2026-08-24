import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env file with override=True
env_file = Path(__file__).resolve().parent.parent / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file, override=True)
else:
    load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from .routers import health, auth, listings, leads, favorites, alerts, valuation, open_houses, community
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

# High-Speed GZip Compression for all API Responses (>500 bytes)
app.add_middleware(GZipMiddleware, minimum_size=500)

@app.on_event("startup")
def on_startup():
    start_scheduler()

# High-Speed CORS Configuration with 24-Hour Preflight Caching
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
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
app.include_router(valuation.router)
app.include_router(open_houses.router)
app.include_router(community.router)

@app.get("/")
def read_root():
    return {
        "message": "Estateline API is running.",
        "docs_url": "/docs",
        "health_check_url": "/health"
    }
