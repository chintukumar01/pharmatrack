from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Order Item Schemas
class OrderItemCreate(BaseModel):
    medicine_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    medicine_id: int
    medicine_name: str
    quantity: int
    price: float
    subtotal: float

    class Config:
        from_attributes = True

# Order Schemas
class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str
    payment_mode: str  # UPI, COD

class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    status: str
    total_amount: float
    payment_mode: str
    payment_status: str
    shipping_address: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str  # Placed, Packed, Shipped, Delivered, Cancelled
