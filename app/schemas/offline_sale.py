from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime

class OfflineSaleItem(BaseModel):
    medicine_id: int
    medicine_name: str
    quantity: int
    price: float
    subtotal: float

class OfflineSaleCreate(BaseModel):
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    items: List[OfflineSaleItem]
    payment_mode: str  # Cash, Card, UPI

class OfflineSaleResponse(BaseModel):
    id: int
    invoice_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    subtotal: float
    tax: float
    total_amount: float
    payment_mode: str
    created_at: datetime

    class Config:
        from_attributes = True
