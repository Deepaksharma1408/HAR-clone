def send_email(to_email: str, subject: str, body: str) -> None:
    """
    Email sender stub. Logs the email contents to the console.
    """
    print("\n" + "=" * 60)
    print("📧 [EMAIL STUB] OUTGOING MAIL")
    print(f"To:      {to_email}")
    print(f"Subject: {subject}")
    print("-" * 60)
    print(body)
    print("=" * 60 + "\n")
