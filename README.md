# 🏥 PharmaTrack - Pharmacy Management System

A comprehensive full-stack pharmacy management system with role-based authentication, inventory management, online ordering, appointment booking, and sales analytics.

## ✨ Features

### 👤 User Features
- **Email OTP Authentication** - Secure login with one-time password
- **Medicine Browsing** - Search and filter through 30+ medicines across 11 categories
- **Shopping Cart** - Add, remove, update quantities with real-time stock validation
- **Online Ordering** - Multiple payment options (UPI mock payment, Cash on Delivery)
- **Appointment Booking** - Book appointments with specialized doctors
- **Order Tracking** - View order history and status updates
- **Email Notifications** - Receive updates on order status changes

### 👨‍💼 Admin Features
- **Dashboard Analytics** - Real-time stats (today's revenue, orders, low stock alerts, pending appointments)
- **Offline Sales & Billing** - Create bills, generate printable invoices with auto-invoice numbering
- **Appointment Management** - Approve/reject/complete appointments with email notifications
- **Order Management** - Update order status (Pending → Processing → Shipped → Delivered)
- **Inventory Management** - Full CRUD operations, search functionality, low-stock warnings
- **Sales Analytics** - Revenue charts, payment mode analysis, top-selling medicines
- **Stock Auto-Management** - Automatic stock reduction on sales/orders

### 🎨 Modern UI/UX
- **Purple Gradient Theme** - Modern design with glassmorphism effects
- **Toast Notifications** - Non-blocking, auto-dismiss notifications (no annoying pop-ups!)
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Slide-in effects, hover transitions, loading states

---

## 🛠️ Tech Stack

**Backend:**
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Pydantic** - Data validation with type hints
- **JWT** - JSON Web Token authentication (30-minute expiry)
- **Python-Jose** - JWT encoding/decoding
- **Passlib + Bcrypt** - Password hashing
- **Python-Multipart** - Form data handling

**Frontend:**
- **Vanilla JavaScript** - No framework dependencies
- **HTML5 & CSS3** - Modern semantic markup and styling
- **Fetch API** - RESTful API communication

**Email Service:**
- **SMTP** - Email delivery for OTP and notifications

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** (Check: `python3 --version`)
- **pip** (Python package manager)
- **Virtual environment** support
- **SMTP credentials** (Gmail recommended for email service)

---

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project Directory

```bash
cd /Users/ch.shiva/projects/pharmacy-system
```

### 2. Create Virtual Environment

```bash
python3 -m venv venv
```

### 3. Activate Virtual Environment

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

**Dependencies installed:**
- fastapi
- uvicorn[standard]
- sqlalchemy
- pydantic
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart
- python-dotenv

### 5. Configure Environment Variables

Create/edit the `.env` file in the project root:

```bash
# .env file
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

**⚠️ Important Notes:**
- **No spaces around `=`** (e.g., `KEY=value`, NOT `KEY = value`)
- For Gmail: Use **App Password**, not your regular password
  - Enable 2FA on Gmail → Google Account → Security → App Passwords
- Change `SECRET_KEY` for production deployment

### 6. Initialize Database

```bash
python create_table.py
```

This creates the SQLite database with all required tables:
- `users` - User authentication data
- `otps` - One-time passwords for login
- `medicines` - Medicine inventory
- `orders` - Online orders
- `order_items` - Order line items
- `appointments` - Doctor appointments
- `offline_sales` - In-store sales records
- `doctors` - Doctor information

### 7. Seed Sample Data

```bash
python seed_data.py
```

This populates the database with:
- **33 medicines** across 11 categories (Pain Relief, Antibiotics, Cardiovascular, Vitamins, etc.)
- **5 specialized doctors** (Cardiologist, Dermatologist, Orthopedic, General Physician, Pediatrician)

**Success message:**
```
Added 33 medicines
Added 5 doctors
Seeding completed successfully!
```

### 8. Start the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Server starts at:** `http://localhost:8000`

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## 🎯 Usage Guide

### Access the Application

**Login Page:** `http://localhost:8000/static/login.html`

### User Login Flow

1. **Enter Email** → Click "Send OTP"
2. **Check Email** → Copy 6-digit OTP (valid for 1 minute)
3. **Enter OTP** → Click "Verify & Login"
4. **Redirected** → User dashboard or Admin dashboard based on role

### Admin Access

**Admin Email:** `sailendrabramham2003@yahoo.com`

**Admin Features:****
- Dashboard with real-time stats
- Offline sales billing with print invoice
- Appointment approval/rejection
- Order status updates
- Inventory management (CRUD operations)
- Sales analytics with charts

### User Access

**Any other email** (e.g., `user@example.com`, `test@gmail.com`)

**User Features:**
- Browse 33+ medicines with search
- Add to cart with quantity selection
- Checkout with address and payment options
- Track orders and view history
- Book appointments with doctors

---

## 📁 Project Structure

```
pharmacy-system/
├── app/
│   ├── api/
│   │   ├── auth.py              # Authentication endpoints (OTP, login)
│   │   ├── user.py              # User endpoints (browse, cart, orders, appointments)
│   │   └── admin.py             # Admin endpoints (inventory, sales, analytics)
│   ├── core/
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Database connection
│   │   ├── dependencies.py      # JWT authentication dependencies
│   │   └── security.py          # Password hashing, token creation
│   ├── models/
│   │   ├── user.py              # User model
│   │   ├── otp.py               # OTP model
│   │   ├── medicine.py          # Medicine model
│   │   ├── order.py             # Order & OrderItem models
│   │   ├── appointment.py       # Appointment model
│   │   ├── offline_sale.py      # OfflineSale model
│   │   └── doctor.py            # Doctor model
│   ├── schemas/
│   │   ├── auth.py              # Pydantic schemas for auth
│   │   ├── user.py              # Pydantic schemas for user operations
│   │   └── admin.py             # Pydantic schemas for admin operations
│   ├── services/
│   │   └── email_service.py     # SMTP email service
│   ├── static/
│   │   ├── login.html           # Login page
│   │   ├── login.css            # Login styles
│   │   ├── login.js             # Login logic
│   │   ├── user.html            # User dashboard (browse medicines)
│   │   ├── user.css             # User styles (purple gradient theme)
│   │   ├── user.js              # User logic
│   │   ├── cart.html            # Shopping cart
│   │   ├── cart.js              # Cart logic
│   │   ├── orders.html          # Order history
│   │   ├── orders.js            # Orders logic
│   │   ├── appointments.html    # Appointments booking
│   │   ├── appointments.js      # Appointments logic
│   │   ├── admin.html           # Admin dashboard
│   │   ├── admin.css            # Admin styles (blue theme)
│   │   └── admin.js             # Admin logic
│   └── main.py                  # FastAPI app initialization
├── venv/                        # Virtual environment (not in git)
├── .env                         # Environment variables (not in git)
├── create_table.py              # Database table creation script
├── seed_data.py                 # Sample data seeding script
├── requirements.txt             # Python dependencies
├── pharmacy.db                  # SQLite database (created after setup)
└── README.md                    # This file
```

---

## 🔗 API Documentation

Once the server is running, access interactive API documentation:

**Swagger UI:** `http://localhost:8000/docs`

**ReDoc:** `http://localhost:8000/redoc`

### Key API Endpoints

**Authentication:**
- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP and get JWT token

**User APIs:**
- `GET /user/medicines` - Browse medicines with search
- `POST /user/orders` - Place new order
- `GET /user/orders` - Get user's order history
- `POST /user/orders/{id}/payment` - Process UPI payment
- `POST /user/appointments` - Book appointment
- `GET /user/appointments` - Get user's appointments

**Admin APIs:**
- `GET /admin/appointments` - Get all appointments (with filters)
- `PUT /admin/appointments/{id}/status` - Update appointment status
- `GET /admin/orders` - Get all orders (with filters)
- `PUT /admin/orders/{id}/status` - Update order status
- `GET /admin/medicines` - Get all medicines
- `POST /admin/medicines` - Add new medicine
- `PUT /admin/medicines/{id}` - Update medicine
- `DELETE /admin/medicines/{id}` - Delete medicine
- `POST /admin/offline-sales` - Create offline sale
- `GET /admin/offline-sales` - Get sales history
- `GET /admin/analytics/dashboard` - Dashboard stats
- `GET /admin/analytics/sales` - Sales analytics

---

## 🎨 UI Features

### Toast Notifications

All user feedback uses **non-blocking toast notifications**:
- ✅ **Success** (green) - "Medicine added to cart!", "Order placed successfully!"
- ❌ **Error** (red) - API failures, validation errors
- ⚠️ **Warning** (orange) - Stock limits, empty cart warnings
- ℹ️ **Info** (blue) - General information

**Features:**
- Slide-in animation from right
- Auto-dismiss after 3 seconds
- Manual close button
- Progress bar indicator
- Fully responsive

### Design Theme

**User Pages:**
- Purple gradient background (`#667eea` → `#764ba2`)
- White glassmorphism navbar with blur effect
- Rounded cards with modern shadows
- Smooth hover animations

**Admin Pages:**
- Blue professional theme (`#1e3a8a`)
- Sidebar navigation
- Stats cards with hover effects
- Data tables with responsive design

---

## 🧪 Testing the Application

### 1. Test User Flow

```bash
# Open browser
http://localhost:8000/static/login.html

# Login as user
Email: test@example.com
# Check email for OTP, enter and verify

# Browse medicines
# Search: "paracetamol"
# Add to cart (quantity: 2)
# Go to cart
# Checkout with address
# Select payment: UPI (80% success rate) or COD
# View orders
# Book appointment with doctor
```

### 2. Test Admin Flow

```bash
# Login as admin
Email: sailendrabramham2003@yahoo.com
# Check email for OTP

# Dashboard - view stats
# Offline Sales:
  - Select medicine
  - Add quantity
  - Enter customer details
  - Complete sale
  - Print invoice

# Appointments:
  - View pending appointments
  - Approve/reject appointments

# Orders:
  - View all orders
  - Update status (Processing → Shipped → Delivered)

# Inventory:
  - Search medicines
  - Add new medicine
  - Edit existing medicine
  - Delete medicine
  - View low-stock alerts

# Analytics:
  - View revenue by period (7 days, 30 days, 90 days)
  - Payment mode distribution
  - Top-selling medicines
```

---

## 🔧 Troubleshooting

### Issue: Module not found error

```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Database not found

```bash
# Recreate database
python create_table.py
python seed_data.py
```

### Issue: Email OTP not received

1. Check `.env` file configuration
2. Verify SMTP credentials
3. For Gmail: Ensure App Password is used (not regular password)
4. Check spam/junk folder
5. Check terminal for SMTP connection errors

### Issue: CSS not loading or old design showing

```bash
# Hard refresh browser
Ctrl + Shift + R  # Windows/Linux
Cmd + Shift + R   # macOS

# Or clear browser cache
# CSS files use version query params (?v=3.0) for cache busting
```

### Issue: Port 8000 already in use

```bash
# Use different port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Or kill existing process
# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: Virtual environment not activating

```bash
# Delete and recreate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📊 Database Schema

**Users Table:**
- id (Primary Key)
- email (Unique)
- role (admin/user)
- created_at

**OTPs Table:**
- id (Primary Key)
- email
- otp_code (6 digits)
- expires_at (1 minute validity)
- created_at

**Medicines Table:**
- id (Primary Key)
- name
- category
- description
- price
- stock
- low_stock_threshold
- manufacturer
- created_at, updated_at

**Orders Table:**
- id (Primary Key)
- user_id (Foreign Key)
- total_amount
- shipping_address
- payment_mode (UPI/COD)
- payment_status
- status (Pending/Processing/Shipped/Delivered/Cancelled)
- created_at, updated_at

**Order Items Table:**
- id (Primary Key)
- order_id (Foreign Key)
- medicine_id (Foreign Key)
- quantity
- price

**Appointments Table:**
- id (Primary Key)
- user_id (Foreign Key)
- doctor_name
- specialization
- appointment_date
- appointment_time
- reason
- status (Pending/Approved/Rejected/Completed/Cancelled)
- created_at, updated_at

**Offline Sales Table:**
- id (Primary Key)
- invoice_number (Auto-generated)
- customer_name
- customer_phone
- items (JSON)
- subtotal
- tax (5%)
- total_amount
- payment_mode
- created_at

**Doctors Table:**
- id (Primary Key)
- name
- specialization
- qualification
- experience
- available

---

## 🚢 Deployment

### Production Considerations

1. **Change SECRET_KEY** in `.env` to a strong random value
2. **Use PostgreSQL** instead of SQLite for production
3. **Enable HTTPS** with SSL certificates
4. **Set up proper email service** (SendGrid, AWS SES, etc.)
5. **Configure CORS** for specific domains
6. **Add rate limiting** for API endpoints
7. **Set up logging** and monitoring
8. **Use environment-specific configs**

### Deploy to Cloud Platforms

**Heroku / Railway / Render:**
- Add `Procfile`: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set environment variables in platform dashboard
- Connect GitHub repository for auto-deployment

**AWS / Google Cloud / Azure:**
- Containerize with Docker
- Use managed database services
- Set up load balancing
- Configure auto-scaling

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Developer

Developed with ❤️ by **Ch. Shiva**

**Tech Stack:** FastAPI, SQLAlchemy, SQLite, Vanilla JS, HTML5, CSS3

---

## 📞 Support

For issues, questions, or feature requests, please:
- Check the **Troubleshooting** section above
- Review **API documentation** at `http://localhost:8000/docs`
- Ensure all **prerequisites** are met
- Verify **.env configuration** is correct

---

## 🎯 Quick Start Summary

```bash
# 1. Navigate to project
cd /Users/ch.shiva/projects/pharmacy-system

# 2. Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure .env file
# (Add SMTP credentials)

# 5. Initialize database
python create_table.py
python seed_data.py

# 6. Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 7. Open browser
# http://localhost:8000/static/login.html
```

**Admin:** `sailendrabramham2003@yahoo.com`  
**User:** Any other email

---

**Happy Coding! 🚀💊**