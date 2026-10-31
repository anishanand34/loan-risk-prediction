import os

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, inspect, text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import User, Prediction
from .schemas import UserCreate, UserLogin, LoanInput
from .auth import hash_password, verify_password, needs_rehash
from .ml_model import predict_loan_risk, MODEL_META

app = FastAPI()

# Set ALLOWED_ORIGINS="http://localhost:5173,https://your-site.com" in production.
# Default "*" keeps local development working. Credentials are off because
# the API does not use cookies (browsers reject "*" together with credentials).
allowed_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def ensure_cibil_column():
    """create_all() does not alter existing tables, so add the new column if missing."""
    columns = [c["name"] for c in inspect(engine).get_columns("predictions")]
    if "cibil_score" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE predictions ADD COLUMN cibil_score INTEGER"))


ensure_cibil_column()


def serialize_prediction(p: Prediction):
    return {
        "id": p.id,
        "user_id": p.user_id,
        "income": p.income,
        "loan_amount": p.loan_amount,
        "cibil_score": p.cibil_score,
        "loan_to_income": p.loan_to_income,
        "risk_level": p.risk_level,
        "confidence": p.confidence,
        "recommendation": p.recommendation,
        "model_version": p.model_version,
        "created_at": p.created_at,
    }


@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}


@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
        },
    }


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user or not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Silently upgrade old unsalted SHA-256 hashes to the new salted format
    if needs_rehash(existing_user.password_hash):
        existing_user.password_hash = hash_password(user.password)
        db.commit()

    return {
        "message": "Login successful",
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email,
        },
    }


@app.post("/predict")
def predict_loan(request: LoanInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        ml_result = predict_loan_risk(
            request.income,
            request.loan_amount,
            request.cibil_score,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    new_prediction = Prediction(
        user_id=request.user_id,
        income=request.income,
        loan_amount=request.loan_amount,
        cibil_score=request.cibil_score,
        loan_to_income=ml_result["loan_to_income"],
        risk_level=ml_result["risk_level"],
        confidence=ml_result["confidence"],
        recommendation=ml_result["recommendation"],
        model_version=ml_result["model_version"],
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return serialize_prediction(new_prediction)


@app.get("/history/{user_id}")
def get_prediction_history(user_id: int, db: Session = Depends(get_db)):
    history = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return [serialize_prediction(p) for p in history]


@app.get("/analytics/{user_id}")
def get_analytics(user_id: int, db: Session = Depends(get_db)):
    # Let the database do the counting/averaging instead of looping in Python
    counts = dict(
        db.query(Prediction.risk_level, func.count(Prediction.id))
        .filter(Prediction.user_id == user_id)
        .group_by(Prediction.risk_level)
        .all()
    )

    total, avg_income, avg_loan, avg_lti, avg_confidence = (
        db.query(
            func.count(Prediction.id),
            func.avg(Prediction.income),
            func.avg(Prediction.loan_amount),
            func.avg(Prediction.loan_to_income),
            func.avg(Prediction.confidence),
        )
        .filter(Prediction.user_id == user_id)
        .one()
    )

    return {
        "total": total or 0,
        "low": counts.get("Low Risk", 0),
        "medium": counts.get("Medium Risk", 0),
        "high": counts.get("High Risk", 0),
        "avg_income": round(avg_income or 0, 2),
        "avg_loan": round(avg_loan or 0, 2),
        "avg_lti": round(avg_lti or 0, 2),
        "avg_confidence": round(avg_confidence or 0, 2),
    }


@app.delete("/prediction/{prediction_id}")
def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    prediction = db.query(Prediction).filter(Prediction.id == prediction_id).first()

    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    db.delete(prediction)
    db.commit()

    return {"message": "Prediction deleted successfully"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "LoanWise backend is running"}


@app.get("/model-info")
def model_info():
    # Comes from model_meta.json written by train_model.py, so it is always accurate
    return MODEL_META