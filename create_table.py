from app.core.database import Base, engine
from app.models.user import User
from app.models.otp import OTP
from app.models.medicine import Medicine
from app.models.order import Order, OrderItem
from app.models.appointment import Appointment
from app.models.offline_sale import OfflineSale
from app.models.doctor import Doctor

Base.metadata.create_all(bind=engine)
print("Database tables created successfully")
