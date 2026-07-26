import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
model_path = os.path.join(BASE_DIR, "loan_model.pkl")

model = joblib.load(model_path)

MODEL_VERSION = "1.0"

risk_map = {
    0: "Low Risk",
    1: "Medium Risk",
    2: "High Risk"
}

def predict_loan_risk(income, loan_amount):
    loan_to_income = loan_amount / income

    # Business rule override for obvious cases
    if loan_to_income < 0.3:
        return {
            "loan_to_income": round(loan_to_income, 2),
            "risk_level": "Low Risk",
            "confidence": 95.0,
            "recommendation": "Loan looks safe based on income and borrowing amount.",
            "model_version": "hybrid_1.0"
        }

    if loan_to_income > 0.8:
        return {
            "loan_to_income": round(loan_to_income, 2),
            "risk_level": "High Risk",
            "confidence": 92.0,
            "recommendation": "Loan is risky due to high loan amount compared to income.",
            "model_version": "hybrid_1.0"
        }

    # ML model for middle cases
    input_data = pd.DataFrame([{
        "income": income,
        "loan_amount": loan_amount,
        "loan_to_income": loan_to_income
    }])

    prediction = model.predict(input_data)[0]
    probabilities = model.predict_proba(input_data)[0]
    confidence = max(probabilities) * 100

    risk_level = risk_map[prediction]

    if risk_level == "Low Risk":
        recommendation = "Loan looks safe based on income and borrowing amount."
    elif risk_level == "Medium Risk":
        recommendation = "Loan may be manageable, but repayment capacity should be reviewed."
    else:
        recommendation = "Loan is risky due to high loan amount compared to income."

    return {
        "loan_to_income": round(loan_to_income, 2),
        "risk_level": risk_level,
        "confidence": round(confidence, 2),
        "recommendation": recommendation,
        "model_version": "hybrid_1.0"
    }