from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    income = Column(Float, nullable=False)
    loan_amount = Column(Float, nullable=False)
    loan_to_income = Column(Float, nullable=False)

    risk_level = Column(String, nullable=False)
    confidence = Column(Float, default=0.0)        # ✅ ADD THIS
    recommendation = Column(String, nullable=False)
    model_version = Column(String, default="1.0")  # ✅ ADD THIS

    created_at = Column(DateTime, default=datetime.utcnow)