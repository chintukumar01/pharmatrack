from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AppointmentCreate(BaseModel):
    doctor_name: str
    specialization: str
    appointment_date: datetime
    appointment_time: str
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    user_id: int
    doctor_name: str
    specialization: str
    appointment_date: datetime
    appointment_time: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: str  # Pending, Approved, Rejected, Completed

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    available_days: str
    available_time: str
    phone: Optional[str]
    email: Optional[str]

    class Config:
        from_attributes = True
