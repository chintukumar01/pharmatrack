from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import json

from app.core.dependencies import get_db
from app.core.security import require_admin
from app.models.appointment import Appointment
from app.models.order import Order, OrderItem
from app.models.medicine import Medicine
from app.models.offline_sale import OfflineSale
from app.models.user import User
from app.schemas.appointment import AppointmentResponse, AppointmentStatusUpdate
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.medicine import MedicineCreate, MedicineUpdate, MedicineResponse
from app.schemas.offline_sale import OfflineSaleCreate, OfflineSaleResponse

router = APIRouter()

# ============== APPOINTMENT MANAGEMENT ==============

@router.get("/appointments", response_model=List[AppointmentResponse])
def get_all_appointments(
    status: Optional[str] = None,
    doctor: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get all appointments with optional filters"""
    query = db.query(Appointment)
    
    if status:
        query = query.filter(Appointment.status == status)
    if doctor:
        query = query.filter(Appointment.doctor_name.contains(doctor))
    if date:
        target_date = datetime.fromisoformat(date)
        query = query.filter(func.date(Appointment.appointment_date) == target_date.date())
    
    appointments = query.order_by(Appointment.appointment_date.desc()).all()
    return appointments

@router.put("/appointments/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    data: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Update appointment status (Approve/Reject/Complete)"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = data.status
    db.commit()
    db.refresh(appointment)
    
    return {"message": f"Appointment {data.status.lower()} successfully", "appointment": appointment}

# ============== ORDERS MANAGEMENT ==============

@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get all orders with optional status filter"""
    query = db.query(Order)
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).all()
    return orders

@router.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Update order status (Placed/Packed/Shipped/Delivered/Cancelled)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = data.status
    db.commit()
    db.refresh(order)
    
    return {"message": f"Order status updated to {data.status}", "order": order}

# ============== INVENTORY MANAGEMENT ==============

@router.get("/medicines", response_model=List[MedicineResponse])
def get_all_medicines(
    low_stock: bool = False,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get all medicines, optionally filter low stock items"""
    query = db.query(Medicine)
    
    if low_stock:
        query = query.filter(Medicine.stock <= Medicine.low_stock_threshold)
    
    medicines = query.order_by(Medicine.name).all()
    return medicines

@router.post("/medicines", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
def create_medicine(
    data: MedicineCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Add new medicine to inventory"""
    medicine = Medicine(**data.dict())
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine

@router.put("/medicines/{medicine_id}", response_model=MedicineResponse)
def update_medicine(
    medicine_id: int,
    data: MedicineUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Update medicine details"""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(medicine, key, value)
    
    db.commit()
    db.refresh(medicine)
    return medicine

@router.delete("/medicines/{medicine_id}")
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Delete medicine from inventory"""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db.delete(medicine)
    db.commit()
    return {"message": "Medicine deleted successfully"}

# ============== OFFLINE SALES & BILLING ==============

@router.post("/offline-sales", response_model=OfflineSaleResponse, status_code=status.HTTP_201_CREATED)
def create_offline_sale(
    data: OfflineSaleCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Create offline sale and generate invoice"""
    # Calculate totals
    subtotal = sum(item.subtotal for item in data.items)
    tax = subtotal * 0.05  # 5% tax
    total_amount = subtotal + tax
    
    # Generate invoice number
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    invoice_number = f"INV-{timestamp}"
    
    # Reduce stock for each medicine
    for item in data.items:
        medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine {item.medicine_name} not found")
        
        if medicine.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {medicine.name}")
        
        medicine.stock -= item.quantity
    
    # Create sale record
    offline_sale = OfflineSale(
        invoice_number=invoice_number,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        items=json.dumps([item.dict() for item in data.items]),
        subtotal=subtotal,
        tax=tax,
        total_amount=total_amount,
        payment_mode=data.payment_mode
    )
    
    db.add(offline_sale)
    db.commit()
    db.refresh(offline_sale)
    
    return offline_sale

@router.get("/offline-sales", response_model=List[OfflineSaleResponse])
def get_offline_sales(
    limit: int = 100,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get offline sales history"""
    sales = db.query(OfflineSale).order_by(OfflineSale.created_at.desc()).limit(limit).all()
    return sales

# ============== SALES ANALYTICS ==============

@router.get("/analytics/sales")
def get_sales_analytics(
    period: str = "daily",  # daily, weekly, monthly
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get sales analytics for specified period"""
    now = datetime.now(timezone.utc)
    
    if period == "daily":
        start_date = now - timedelta(days=1)
    elif period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=1)
    
    # Online orders analytics
    online_orders = db.query(
        func.count(Order.id).label("total_orders"),
        func.sum(Order.total_amount).label("total_revenue"),
        Order.payment_mode
    ).filter(
        Order.created_at >= start_date,
        Order.status != "Cancelled"
    ).group_by(Order.payment_mode).all()
    
    # Offline sales analytics
    offline_sales = db.query(
        func.count(OfflineSale.id).label("total_sales"),
        func.sum(OfflineSale.total_amount).label("total_revenue")
    ).filter(OfflineSale.created_at >= start_date).first()
    
    # Top selling medicines (online)
    top_medicines = db.query(
        OrderItem.medicine_name,
        func.sum(OrderItem.quantity).label("total_quantity"),
        func.sum(OrderItem.subtotal).label("total_revenue")
    ).join(Order).filter(
        Order.created_at >= start_date,
        Order.status != "Cancelled"
    ).group_by(OrderItem.medicine_name).order_by(func.sum(OrderItem.quantity).desc()).limit(10).all()
    
    # Calculate totals
    total_online_revenue = sum(order.total_revenue or 0 for order in online_orders)
    total_offline_revenue = offline_sales.total_revenue or 0 if offline_sales else 0
    
    payment_split = {}
    for order in online_orders:
        payment_split[order.payment_mode] = {
            "orders": order.total_orders,
            "revenue": float(order.total_revenue or 0)
        }
    
    return {
        "period": period,
        "total_revenue": total_online_revenue + total_offline_revenue,
        "online_revenue": total_online_revenue,
        "offline_revenue": total_offline_revenue,
        "payment_split": payment_split,
        "top_medicines": [
            {
                "name": med.medicine_name,
                "quantity_sold": med.total_quantity,
                "revenue": float(med.total_revenue)
            }
            for med in top_medicines
        ]
    }

@router.get("/analytics/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin)
):
    """Get overall dashboard statistics"""
    total_medicines = db.query(func.count(Medicine.id)).scalar()
    low_stock_count = db.query(func.count(Medicine.id)).filter(
        Medicine.stock <= Medicine.low_stock_threshold
    ).scalar()
    
    pending_appointments = db.query(func.count(Appointment.id)).filter(
        Appointment.status == "Pending"
    ).scalar()
    
    today = datetime.now(timezone.utc).date()
    today_orders = db.query(func.count(Order.id)).filter(
        func.date(Order.created_at) == today
    ).scalar()
    
    today_revenue = db.query(func.sum(Order.total_amount)).filter(
        func.date(Order.created_at) == today,
        Order.status != "Cancelled"
    ).scalar() or 0
    
    return {
        "total_medicines": total_medicines,
        "low_stock_items": low_stock_count,
        "pending_appointments": pending_appointments,
        "today_orders": today_orders,
        "today_revenue": float(today_revenue)
    }
