import os
import json
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "loan_model.pkl")
META_PATH = os.path.join(BASE_DIR, "model_meta.json")

FEATURES = ["income", "loan_amount", "loan_to_income", "cibil_score"]

model = joblib.load(MODEL_PATH)

risk_map = {
    0: "Low Risk",
    1: "Medium Risk",
    2: "High Risk",
}


def _load_meta():
    default = {
        "model_name": "Unknown",
        "model_version": "1.0",
        "accuracy": None,
        "features": FEATURES,
        "target": "risk_level",
        "dataset": "Loan Approval Prediction Dataset",
        "report_file": "model_report.txt",
    }
    try:
        with open(META_PATH, "r") as f:
            default.update(json.load(f))
    except FileNotFoundError:
        pass
    return default


# Written by train_model.py, so /model-info always matches the saved model
MODEL_META = _load_meta()
MODEL_VERSION = f'{MODEL_META["model_name"]} v{MODEL_META["model_version"]}'

# Min/max of each feature seen in training (saved by train_model.py)
FEATURE_RANGES = MODEL_META.get("feature_ranges", {})
FEATURE_LABELS = {
    "income": "annual income",
    "loan_amount": "loan amount",
    "loan_to_income": "loan-to-income ratio",
    "cibil_score": "CIBIL score",
}


def predict_loan_risk(income: float, loan_amount: float, cibil_score: int):
    if income <= 0:
        raise ValueError("Income must be greater than 0")
    if loan_amount <= 0:
        raise ValueError("Loan amount must be greater than 0")

    loan_to_income = loan_amount / income

    # Column names and order must match training exactly
    input_data = pd.DataFrame([{
        "income": income,
        "loan_amount": loan_amount,
        "loan_to_income": loan_to_income,
        "cibil_score": cibil_score,
    }])[FEATURES]

    prediction = int(model.predict(input_data)[0])
    probabilities = model.predict_proba(input_data)[0]

    # Probability the model assigns to the class it predicted (a real model output)
    class_index = list(model.classes_).index(prediction)
    confidence = float(probabilities[class_index]) * 100

    risk_level = risk_map[prediction]

    if risk_level == "Low Risk":
        recommendation = "Loan looks safe based on income, borrowing amount and credit score."
    elif risk_level == "Medium Risk":
        recommendation = "Loan may be manageable, but repayment capacity should be reviewed."
    else:
        recommendation = "Loan is risky based on the loan amount relative to income and credit profile."

    if cibil_score < 650 and risk_level != "High Risk":
        recommendation += " A low credit score may still reduce approval chances."

    # The model cannot extrapolate: flag inputs it has never seen anything like
    outside = [
        FEATURE_LABELS[name]
        for name, (low, high) in FEATURE_RANGES.items()
        if name in FEATURE_LABELS and not (low <= input_data.iloc[0][name] <= high)
    ]
    if outside:
        recommendation += (
            " Warning: " + ", ".join(outside) + " is outside the range the model was "
            "trained on, so this result and its confidence are unreliable."
        )

    return {
        "loan_to_income": round(loan_to_income, 2),
        "risk_level": risk_level,
        "confidence": round(confidence, 2),
        "recommendation": recommendation,
        "model_version": MODEL_VERSION,
    }