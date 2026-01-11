from app.core.database import SessionLocal
from app.models.medicine import Medicine
from app.models.doctor import Doctor
from datetime import datetime, timedelta

db = SessionLocal()

# Sample Medicines
medicines = [
    {
        "name": "Paracetamol 500mg",
        "category": "Pain Relief",
        "description": "Effective pain reliever and fever reducer",
        "price": 50.00,
        "stock": 500,
        "low_stock_threshold": 100,
        "manufacturer": "PharmaCorp"
    },
    {
        "name": "Amoxicillin 250mg",
        "category": "Antibiotics",
        "description": "Broad-spectrum antibiotic for bacterial infections",
        "price": 150.00,
        "stock": 200,
        "low_stock_threshold": 50,
        "manufacturer": "MediLife"
    },
    {
        "name": "Cetirizine 10mg",
        "category": "Allergy",
        "description": "Antihistamine for allergic reactions",
        "price": 80.00,
        "stock": 300,
        "low_stock_threshold": 50,
        "manufacturer": "HealthPlus"
    },
    {
        "name": "Omeprazole 20mg",
        "category": "Digestive Health",
        "description": "Reduces stomach acid production",
        "price": 120.00,
        "stock": 150,
        "low_stock_threshold": 30,
        "manufacturer": "GastroMed"
    },
    {
        "name": "Aspirin 75mg",
        "category": "Cardiovascular",
        "description": "Blood thinner and pain reliever",
        "price": 45.00,
        "stock": 400,
        "low_stock_threshold": 80,
        "manufacturer": "CardioHealth"
    },
    {
        "name": "Ibuprofen 400mg",
        "category": "Pain Relief",
        "description": "Anti-inflammatory pain reliever",
        "price": 65.00,
        "stock": 350,
        "low_stock_threshold": 70,
        "manufacturer": "PharmaCorp"
    },
    {
        "name": "Vitamin C 1000mg",
        "category": "Vitamins",
        "description": "Immune system support",
        "price": 200.00,
        "stock": 250,
        "low_stock_threshold": 50,
        "manufacturer": "VitaLife"
    },
    {
        "name": "Azithromycin 500mg",
        "category": "Antibiotics",
        "description": "Macrolide antibiotic for respiratory infections",
        "price": 180.00,
        "stock": 100,
        "low_stock_threshold": 25,
        "manufacturer": "MediLife"
    },
    {
        "name": "Metformin 500mg",
        "category": "Diabetes",
        "description": "Blood sugar control medication",
        "price": 90.00,
        "stock": 300,
        "low_stock_threshold": 60,
        "manufacturer": "DiabetCare"
    },
    {
        "name": "Losartan 50mg",
        "category": "Cardiovascular",
        "description": "Blood pressure medication",
        "price": 110.00,
        "stock": 200,
        "low_stock_threshold": 40,
        "manufacturer": "CardioHealth"
    },
    {
        "name": "Cough Syrup",
        "category": "Cold & Flu",
        "description": "Relief from dry and wet cough",
        "price": 95.00,
        "stock": 180,
        "low_stock_threshold": 35,
        "manufacturer": "RespiCare"
    },
    {
        "name": "Multivitamin Tablets",
        "category": "Vitamins",
        "description": "Complete daily vitamin supplement",
        "price": 250.00,
        "stock": 220,
        "low_stock_threshold": 45,
        "manufacturer": "VitaLife"
    },
    {
        "name": "Calcium + Vitamin D3",
        "category": "Vitamins",
        "description": "Bone health supplement",
        "price": 180.00,
        "stock": 150,
        "low_stock_threshold": 30,
        "manufacturer": "BoneStrong"
    },
    {
        "name": "Insulin Glargine",
        "category": "Diabetes",
        "description": "Long-acting insulin injection",
        "price": 850.00,
        "stock": 50,
        "low_stock_threshold": 10,
        "manufacturer": "DiabetCare"
    },
    {
        "name": "Hand Sanitizer 500ml",
        "category": "Hygiene",
        "description": "70% alcohol-based sanitizer",
        "price": 120.00,
        "stock": 400,
        "low_stock_threshold": 80,
        "manufacturer": "HygienePro"
    },
    # Additional medicines to reach 30+
    {
        "name": "Dolo 650mg",
        "category": "Pain Relief",
        "description": "Fast-acting pain and fever relief",
        "price": 55.00,
        "stock": 600,
        "low_stock_threshold": 120,
        "manufacturer": "PharmaCorp"
    },
    {
        "name": "Ciprofloxacin 500mg",
        "category": "Antibiotics",
        "description": "Fluoroquinolone antibiotic",
        "price": 130.00,
        "stock": 180,
        "low_stock_threshold": 40,
        "manufacturer": "MediLife"
    },
    {
        "name": "Ranitidine 150mg",
        "category": "Digestive Health",
        "description": "Acid reflux treatment",
        "price": 85.00,
        "stock": 250,
        "low_stock_threshold": 50,
        "manufacturer": "GastroMed"
    },
    {
        "name": "Atorvastatin 10mg",
        "category": "Cardiovascular",
        "description": "Cholesterol-lowering medication",
        "price": 160.00,
        "stock": 170,
        "low_stock_threshold": 35,
        "manufacturer": "CardioHealth"
    },
    {
        "name": "Diclofenac Gel",
        "category": "Pain Relief",
        "description": "Topical pain relief for joints",
        "price": 140.00,
        "stock": 200,
        "low_stock_threshold": 40,
        "manufacturer": "PharmaCorp"
    },
    {
        "name": "Vitamin B Complex",
        "category": "Vitamins",
        "description": "Complete B vitamin supplement",
        "price": 170.00,
        "stock": 190,
        "low_stock_threshold": 38,
        "manufacturer": "VitaLife"
    },
    {
        "name": "Doxycycline 100mg",
        "category": "Antibiotics",
        "description": "Tetracycline antibiotic",
        "price": 140.00,
        "stock": 160,
        "low_stock_threshold": 32,
        "manufacturer": "MediLife"
    },
    {
        "name": "Pantoprazole 40mg",
        "category": "Digestive Health",
        "description": "Proton pump inhibitor",
        "price": 135.00,
        "stock": 210,
        "low_stock_threshold": 42,
        "manufacturer": "GastroMed"
    },
    {
        "name": "Amlodipine 5mg",
        "category": "Cardiovascular",
        "description": "Calcium channel blocker for hypertension",
        "price": 95.00,
        "stock": 280,
        "low_stock_threshold": 56,
        "manufacturer": "CardioHealth"
    },
    {
        "name": "Montelukast 10mg",
        "category": "Allergy",
        "description": "Asthma and allergy relief",
        "price": 190.00,
        "stock": 140,
        "low_stock_threshold": 28,
        "manufacturer": "HealthPlus"
    },
    {
        "name": "Glimepiride 2mg",
        "category": "Diabetes",
        "description": "Oral diabetes medication",
        "price": 105.00,
        "stock": 220,
        "low_stock_threshold": 44,
        "manufacturer": "DiabetCare"
    },
    {
        "name": "Clopidogrel 75mg",
        "category": "Cardiovascular",
        "description": "Antiplatelet medication",
        "price": 175.00,
        "stock": 130,
        "low_stock_threshold": 26,
        "manufacturer": "CardioHealth"
    },
    {
        "name": "Paracetamol Suspension",
        "category": "Pain Relief",
        "description": "Liquid pain relief for children",
        "price": 75.00,
        "stock": 320,
        "low_stock_threshold": 64,
        "manufacturer": "PharmaCorp"
    },
    {
        "name": "Levofloxacin 500mg",
        "category": "Antibiotics",
        "description": "Broad-spectrum fluoroquinolone",
        "price": 195.00,
        "stock": 110,
        "low_stock_threshold": 22,
        "manufacturer": "MediLife"
    },
    {
        "name": "Zinc Supplement",
        "category": "Vitamins",
        "description": "Immune system and wound healing",
        "price": 145.00,
        "stock": 185,
        "low_stock_threshold": 37,
        "manufacturer": "VitaLife"
    },
    {
        "name": "Hydrocortisone Cream",
        "category": "Skin Care",
        "description": "Anti-inflammatory topical cream",
        "price": 125.00,
        "stock": 160,
        "low_stock_threshold": 32,
        "manufacturer": "DermaCare"
    },
    {
        "name": "Salbutamol Inhaler",
        "category": "Respiratory",
        "description": "Bronchodilator for asthma",
        "price": 280.00,
        "stock": 90,
        "low_stock_threshold": 18,
        "manufacturer": "RespiCare"
    },
    {
        "name": "Eye Drops Refresh",
        "category": "Eye Care",
        "description": "Lubricating eye drops",
        "price": 155.00,
        "stock": 140,
        "low_stock_threshold": 28,
        "manufacturer": "VisionCare"
    }
]

# Sample Doctors
doctors = [
    {
        "name": "Dr. Rajesh Kumar",
        "specialization": "General Physician",
        "available_days": "Mon,Tue,Wed,Thu,Fri",
        "available_time": "9:00 AM - 5:00 PM",
        "phone": "9876543210",
        "email": "rajesh.kumar@clinic.com"
    },
    {
        "name": "Dr. Priya Sharma",
        "specialization": "Cardiologist",
        "available_days": "Mon,Wed,Fri",
        "available_time": "10:00 AM - 4:00 PM",
        "phone": "9876543211",
        "email": "priya.sharma@cardio.com"
    },
    {
        "name": "Dr. Amit Patel",
        "specialization": "Dermatologist",
        "available_days": "Tue,Thu,Sat",
        "available_time": "11:00 AM - 6:00 PM",
        "phone": "9876543212",
        "email": "amit.patel@skin.com"
    },
    {
        "name": "Dr. Sneha Gupta",
        "specialization": "Pediatrician",
        "available_days": "Mon,Tue,Thu,Fri",
        "available_time": "9:00 AM - 3:00 PM",
        "phone": "9876543213",
        "email": "sneha.gupta@kids.com"
    },
    {
        "name": "Dr. Vikram Singh",
        "specialization": "Orthopedic",
        "available_days": "Wed,Fri,Sat",
        "available_time": "10:00 AM - 5:00 PM",
        "phone": "9876543214",
        "email": "vikram.singh@bones.com"
    }
]

try:
    # Check if data already exists
    existing_medicines = db.query(Medicine).count()
    existing_doctors = db.query(Doctor).count()
    
    if existing_medicines == 0:
        print("Adding sample medicines...")
        for med_data in medicines:
            medicine = Medicine(**med_data)
            db.add(medicine)
        print(f"✓ Added {len(medicines)} medicines")
    else:
        print(f"Medicines already exist ({existing_medicines} found)")
    
    if existing_doctors == 0:
        print("Adding sample doctors...")
        for doc_data in doctors:
            doctor = Doctor(**doc_data)
            db.add(doctor)
        print(f"✓ Added {len(doctors)} doctors")
    else:
        print(f"Doctors already exist ({existing_doctors} found)")
    
    db.commit()
    print("\n✅ Sample data seeded successfully!")
    print("\nYou can now:")
    print("1. Login as admin using ADMIN_EMAIL from .env")
    print("2. Login as user using any other email")
    
except Exception as e:
    print(f"❌ Error seeding data: {e}")
    db.rollback()
finally:
    db.close()
