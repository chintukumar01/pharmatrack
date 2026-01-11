from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import random

from app.core.dependencies import get_db
from app.core.security import require_user
from app.models.medicine import Medicine
from app.models.order import Order, OrderItem
from app.models.appointment import Appointment
from app.models.doctor import Doctor
from app.models.user import User
from app.schemas.medicine import MedicineResponse
from app.schemas.order import OrderCreate, OrderResponse
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, DoctorResponse

router = APIRouter()

# ============== BROWSE MEDICINES ==============

@router.get("/medicines", response_model=List[MedicineResponse])
def browse_medicines(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Browse all available medicines"""
    query = db.query(Medicine).filter(Medicine.stock > 0)
    
    if category:
        query = query.filter(Medicine.category == category)
    
    if search:
        query = query.filter(Medicine.name.contains(search))
    
    medicines = query.order_by(Medicine.name).all()
    return medicines

@router.get("/medicines/categories")
def get_categories(db: Session = Depends(get_db)):
    """Get all medicine categories"""
    categories = db.query(Medicine.category).distinct().all()
    return {"categories": [cat[0] for cat in categories]}

@router.get("/medicines/{medicine_id}", response_model=MedicineResponse)
def get_medicine_detail(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    """Get medicine details"""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine

# ============== ORDERS & CHECKOUT ==============

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_user)
):
    """Create new order and checkout"""
    # Get user
    user_email = user.get("sub")
    user_obj = db.query(User).filter(User.email == user_email).first()
    
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate items and calculate total
    total_amount = 0
    order_items = []
    
    for item in data.items:
        medicine = db.query(Medicine).filter(Medicine.id == item.medicine_id).first()
        if not medicine:
            raise HTTPException(status_code=404, detail=f"Medicine ID {item.medicine_id} not found")
        
        if medicine.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {medicine.name}")
        
        subtotal = medicine.price * item.quantity
        total_amount += subtotal
        
        order_items.append({
            "medicine_id": medicine.id,
            "medicine_name": medicine.name,
            "quantity": item.quantity,
            "price": medicine.price,
            "subtotal": subtotal
        })
    
    # Generate order number
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    random_suffix = random.randint(1000, 9999)
    order_number = f"ORD-{timestamp}-{random_suffix}"
    
    # Determine payment status based on payment mode
    payment_status = "Pending" if data.payment_mode == "COD" else "Pending"
    
    # Create order
    order = Order(
        user_id=user_obj.id,
        order_number=order_number,
        status="Placed",
        total_amount=total_amount,
        payment_mode=data.payment_mode,
        payment_status=payment_status,
        shipping_address=data.shipping_address
    )
    
    db.add(order)
    db.flush()  # Get order ID
    
    # Create order items and reduce stock
    for item_data in order_items:
        order_item = OrderItem(
            order_id=order.id,
            **item_data
        )
        db.add(order_item)
        
        # Reduce medicine stock
        medicine = db.query(Medicine).filter(Medicine.id == item_data["medicine_id"]).first()
        medicine.stock -= item_data["quantity"]
    
    db.commit()
    db.refresh(order)
    
    return order

@router.get("/orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    user: dict = Depends(require_user)
):
    """Get user's order history"""
    user_email = user.get("sub")
    user_obj = db.query(User).filter(User.email == user_email).first()
    
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    orders = db.query(Order).filter(Order.user_id == user_obj.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_user)
):
    """Get order details"""
    user_email = user.get("sub")
    user_obj = db.query(User).filter(User.email == user_email).first()
    
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user_obj.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return order

# ============== PAYMENT ==============

@router.post("/orders/{order_id}/payment")
def process_payment(
    order_id: int,
    payment_mode: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_user)
):
    """Process payment for order (UPI mock or COD)"""
    user_email = user.get("sub")
    user_obj = db.query(User).filter(User.email == user_email).first()
    
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == user_obj.id
    ).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if payment_mode == "UPI":
        # Mock UPI payment - 80% success rate
        success = random.random() < 0.8
        
        if success:
            order.payment_status = "Success"
            db.commit()
            return {"success": True, "message": "Payment successful"}
        else:
            order.payment_status = "Failed"
            db.commit()
            return {"success": False, "message": "Payment failed"}
    
    elif payment_mode == "COD":
        order.payment_status = "Pending"
        db.commit()
        return {"success": True, "message": "Order placed with Cash on Delivery"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid payment mode")

# ============== APPOINTMENTS ==============

@router.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    """Get all available doctors"""
    doctors = db.query(Doctor).all()
    return doctors

@router.post("/appointments", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def book_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_user)
):
    """Book doctor appointment"""
    user_email = user.get("sub")
    user_obj = db.query(User).filter(User.email == user_email).first()
    
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    appointment = Appointment(
        user_id=user_obj.id,
        doctor_name=data.doctor_name,
        specialization=data.specialization,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        notes=data.notes,
        status="Pending"
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    return appointment

@router.get("/appointments", response_model=List[AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    user: dict = Depends(require_user)
):
    """Get user's appointment history"""
    user_email = user.get("sub")
    user_obj = db.query(User).filter(User.email == user_email).first()
    
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")
    
    appointments = db.query(Appointment).filter(
        Appointment.user_id == user_obj.id
    ).order_by(Appointment.appointment_date.desc()).all()
    
    return appointments
