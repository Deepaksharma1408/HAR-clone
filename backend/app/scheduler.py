import json
import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from .database import SessionLocal
from .models import SavedAlert
from .services.listings_filter import build_listings_filter_query
from .email import send_email

scheduler = BackgroundScheduler()

def check_saved_alerts_job():
    """
    Scheduled job that checks all saved alerts for new matching listings
    created since the alert's last_checked_at timestamp.
    """
    print("⏰ [SCHEDULER] Running hourly saved alert match check...")
    db = SessionLocal()
    try:
        alerts = db.query(SavedAlert).all()
        now = datetime.datetime.utcnow()

        for alert in alerts:
            user = alert.user
            if not user or not user.email:
                continue

            filter_dict = json.loads(alert.filters) if isinstance(alert.filters, str) else alert.filters
            
            # Query listings matching filters created after last_checked_at
            matching_query = build_listings_filter_query(
                db=db,
                filter_params=filter_dict,
                created_after=alert.last_checked_at
            )
            matches = matching_query.all()

            if matches:
                addresses = [f"• {m.address}, {m.city} (${m.price:,.0f})" for m in matches]
                addresses_text = "\n".join(addresses)
                
                subject = f"Alert Update: {alert.name} ({len(matches)} new matches)"
                body = f"""Hello {user.full_name},

New listings matching your saved alert '{alert.name}' have been posted:

{addresses_text}

Log in to your Estateline account to review full details.

Sincerely,
Estateline Real Estate Advisory
"""
                # Invoke email stub
                send_email(to_email=user.email, subject=subject, body=body)

            # Update last_checked_at timestamp
            alert.last_checked_at = now

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"❌ [SCHEDULER ERROR] {e}")
    finally:
        db.close()

def start_scheduler():
    # Schedule job to run every hour (and run once shortly after startup)
    scheduler.add_job(check_saved_alerts_job, "interval", hours=1, id="check_alerts_job", replace_existing=True)
    scheduler.start()
    print("[SCHEDULER] APScheduler background service initialized.")
