from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Medicine Schemas
class MedicineCreate(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    price: float
    stock: int
    low_stock_threshold: int = 10
    manufacturer: Optional[str] = None
    expiry_date: Optional[datetime] = None

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    manufacturer: Optional[str] = None
    expiry_date: Optional[datetime] = None

class MedicineResponse(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str]
    price: float
    stock: int
    low_stock_threshold: int
    manufacturer: Optional[str]
    expiry_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
