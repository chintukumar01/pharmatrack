from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth, admin, user

app = FastAPI(title="Pharmacy Management System")

# ---------------- CORS (needed for frontend ↔ backend if deployed separately) ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Static Files (Frontend) ----------------
# This serves HTML, CSS, JS from app/static
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ---------------- API Routers ----------------
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(user.router, prefix="/user", tags=["User"])

# ---------------- Health Check ----------------
@app.get("/")
def root():
    return {"status": "Pharmacy backend running"}
