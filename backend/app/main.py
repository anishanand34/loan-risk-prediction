from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, get_db
from .models import User, Prediction
from .schemas import UserCreate, UserLogin, LoanInput
from .auth import hash_password, verify_password
from app.ml_model import predict_loan_risk

app = FastAPI()

app.add_middleware(

    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


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
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
    "message": "User created successfully",
    "user": {
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }
}
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, existing_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user": {
            "id": existing_user.id,
            "name": existing_user.name,
            "email": existing_user.email
        }
    }


@app.post("/predict")
def predict_loan(request: LoanInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == request.user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    ml_result = predict_loan_risk(
        request.income,
        request.loan_amount
    )

    new_prediction = Prediction(
        user_id=request.user_id,
        income=request.income,
        loan_amount=request.loan_amount,
        loan_to_income=ml_result["loan_to_income"],
        risk_level=ml_result["risk_level"],
        confidence=ml_result["confidence"],
        recommendation=ml_result["recommendation"],
        model_version=ml_result["model_version"]
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return {
        "id": new_prediction.id,
        "income": new_prediction.income,
        "loan_amount": new_prediction.loan_amount,
        "loan_to_income": new_prediction.loan_to_income,
        "risk_level": new_prediction.risk_level,
        "confidence": new_prediction.confidence,
        "recommendation": new_prediction.recommendation,
        "model_version": new_prediction.model_version,
        "created_at": new_prediction.created_at
    }


@app.get("/history/{user_id}")
def get_prediction_history(user_id: int, db: Session = Depends(get_db)):
    history = (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )

    return history


@app.get("/analytics/{user_id}")
def get_analytics(user_id: int, db: Session = Depends(get_db)):
    predictions = db.query(Prediction).filter(Prediction.user_id == user_id).all()

    total = len(predictions)

    low = len([p for p in predictions if p.risk_level == "Low Risk"])
    medium = len([p for p in predictions if p.risk_level == "Medium Risk"])
    high = len([p for p in predictions if p.risk_level == "High Risk"])

    avg_income = sum(p.income for p in predictions) / total if total else 0
    avg_loan = sum(p.loan_amount for p in predictions) / total if total else 0
    avg_lti = sum(p.loan_to_income for p in predictions) / total if total else 0
    avg_confidence = sum(p.confidence for p in predictions) / total if total else 0

    return {
        "total": total,
        "low": low,
        "medium": medium,
        "high": high,
        "avg_income": round(avg_income, 2),
        "avg_loan": round(avg_loan, 2),
        "avg_lti": round(avg_lti, 2),
        "avg_confidence": round(avg_confidence, 2)
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
    return {
        "status": "healthy",
        "message": "LoanWise backend is running"
    }
@app.get("/model-info")
def model_info():
    return {
        "model_name": "Logistic Regression",
        "model_version": "1.0",
        "accuracy": 0.6276,
        "features": ["income", "loan_amount", "loan_to_income"],
        "target": "risk_level",
        "dataset": "Loan Approval Prediction Dataset",
        "report_file": "model_report.txt"
    }