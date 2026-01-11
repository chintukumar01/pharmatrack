from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random

from app.core.dependencies import get_db
from app.core.config import settings
from app.models.user import User
from app.models.otp import OTP
from app.schemas.auth import OTPRequest, OTPVerify
from app.core.security import create_access_token
from app.services.email_service import send_otp_email

router = APIRouter()

@router.post("/request-otp")
def request_otp(data: OTPRequest, db: Session = Depends(get_db)):
    otp_code = str(random.randint(100000, 999999))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=1)

    db.query(OTP).filter(OTP.email == data.email).delete()

    db.add(OTP(
        email=data.email,
        otp=otp_code,
        expires_at=expires_at
    ))
    db.commit()

    send_otp_email(data.email, otp_code)

    return {"message": "OTP sent to email"}

@router.post("/verify-otp")
def verify_otp(data: OTPVerify, db: Session = Depends(get_db)):
    otp_entry = db.query(OTP).filter(
        OTP.email == data.email,
        OTP.otp == data.otp
    ).first()

    if not otp_entry or otp_entry.is_expired():
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == data.email).first()
    
    # Determine role based on email
    role = "admin" if data.email == settings.ADMIN_EMAIL else "user"
    
    # Debug logging
    print(f"[AUTH] Login attempt - Email: {data.email}")
    print(f"[AUTH] Admin email from settings: {settings.ADMIN_EMAIL}")
    print(f"[AUTH] Assigned role: {role}")
    print(f"[AUTH] Email match: {data.email == settings.ADMIN_EMAIL}")
    
    if not user:
        # Create new user with correct role
        user = User(email=data.email, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"[AUTH] Created new user with role: {user.role}")
    else:
        # Update existing user's role if it doesn't match
        if user.role != role:
            print(f"[AUTH] Updating user role from {user.role} to {role}")
            user.role = role
            db.commit()
            db.refresh(user)
        else:
            print(f"[AUTH] User already has correct role: {user.role}")

    db.delete(otp_entry)
    db.commit()

    token = create_access_token({
        "sub": user.email,
        "role": user.role
    })

    print(f"[AUTH] Returning role: {user.role}")

    return {
        "access_token": token,
        "role": user.role
    }
