from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from datetime import datetime, timezone
from app.core.database import Base

class OfflineSale(Base):
    __tablename__ = "offline_sales"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, nullable=False, index=True)
    customer_name = Column(String)
    customer_phone = Column(String)
    items = Column(Text, nullable=False)  # JSON string of items
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    payment_mode = Column(String, nullable=False)  # Cash, Card, UPI
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
