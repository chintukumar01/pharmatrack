from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    available_days = Column(String, nullable=False)  # JSON string like "Mon,Tue,Wed"
    available_time = Column(String, nullable=False)  # "9:00 AM - 5:00 PM"
    phone = Column(String)
    email = Column(String)
