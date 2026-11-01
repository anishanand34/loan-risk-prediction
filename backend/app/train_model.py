import os
import json
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "loan_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "loan_model.pkl")
REPORT_PATH = os.path.join(BASE_DIR, "model_report.txt")
META_PATH = os.path.join(BASE_DIR, "model_meta.json")

MODEL_VERSION = "3.1"
FEATURES = ["income", "loan_amount", "loan_to_income", "cibil_score"]

df = pd.read_csv(DATA_PATH)

# Remove hidden spaces from column names
df.columns = df.columns.str.strip()
print("Columns found:", df.columns.tolist())

# Clean text columns
df["loan_status"] = df["loan_status"].astype(str).str.strip()

# Keep only needed columns
df = df[["income_annum", "loan_amount", "loan_status", "cibil_score"]].dropna()

# Rename for our app
df = df.rename(columns={"income_annum": "income"})

# Avoid division by zero
df = df[df["income"] > 0]

# Feature engineering - must happen BEFORE assign_risk
df["loan_to_income"] = df["loan_amount"] / df["income"]

print("\nLoan-to-income distribution:")
print(df["loan_to_income"].describe())

# In this dataset most loans are several times the annual income, so a fixed
# threshold like 0.5 puts almost everyone in the "heavy burden" group and the
# Low Risk class ends up nearly empty. Use a dataset-relative threshold instead:
# the top third of loan-to-income values counts as a heavy burden.
LTI_HEAVY = float(df["loan_to_income"].quantile(0.67))
# An extreme burden (top 10%) is High Risk on its own, whatever the CIBIL score
LTI_VERY_HEAVY = float(df["loan_to_income"].quantile(0.90))
print(f"\nHeavy-burden loan-to-income threshold (67th percentile): {LTI_HEAVY:.3f}")
print(f"Very-heavy-burden threshold (90th percentile): {LTI_VERY_HEAVY:.3f}")


# Target mapping: 3 risk classes from approval status, credit score AND loan burden
def assign_risk(row):
    if row["loan_status"] == "Rejected":
        return 2  # High Risk

    risk_score = 0
    if row["cibil_score"] < 700:
        risk_score += 1
    if row["loan_to_income"] >= LTI_VERY_HEAVY:
        risk_score += 2  # extreme loan burden = High Risk on its own
    elif row["loan_to_income"] >= LTI_HEAVY:
        risk_score += 1

    return min(risk_score, 2)  # 0 = Low, 1 = Medium, 2 = High


df["risk"] = df.apply(assign_risk, axis=1)

print("\nRisk class distribution (0=Low, 1=Medium, 2=High):")
print(df["risk"].value_counts().sort_index())
for cls, share in df["risk"].value_counts(normalize=True).items():
    if share < 0.05:
        print(f"WARNING: class {cls} is only {share:.1%} of the data - the model will rarely predict it")

X = df[FEATURES]
y = df["risk"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    # Scaling is required: income/loan are in millions, cibil is 300-900
    "Logistic Regression": Pipeline([
        ("scale", StandardScaler()),
        ("clf", LogisticRegression(max_iter=2000, class_weight="balanced")),
    ]),
    # min_samples_leaf stops leaves from being 100% pure, so probabilities are less extreme
    "Random Forest": RandomForestClassifier(
        n_estimators=300,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    ),
}

best_model = None
best_name = ""
best_accuracy = 0
report_text = ""

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)

    report_text += f"\nModel: {name}\n"
    report_text += f"Accuracy: {acc:.4f}\n"
    report_text += "Classification Report:\n"
    report_text += classification_report(y_test, preds)
    report_text += "\nConfusion Matrix:\n"
    report_text += str(confusion_matrix(y_test, preds))
    report_text += "\n" + "=" * 50 + "\n"

    if acc > best_accuracy:
        best_accuracy = acc
        best_model = model
        best_name = name

# ---- Check that the model really uses cibil_score ----
if best_name == "Random Forest":
    importances = dict(zip(FEATURES, best_model.feature_importances_.round(3).tolist()))
else:
    importances = {
        cls: dict(zip(FEATURES, row))
        for cls, row in zip(best_model.classes_.tolist(),
                            best_model.named_steps["clf"].coef_.round(3).tolist())
    }
report_text += f"\nFeature influence ({best_name}):\n{importances}\n"
print("\nFeature influence:", importances)

# ---- Sensitivity test: low / typical / high loan burden x different CIBIL scores ----
print("\nSensitivity (income fixed at 5,000,000). Format: class (max probability)")
lti_points = df["loan_to_income"].quantile([0.05, 0.5, 0.95]).tolist()
lti_points.append(float(df["loan_to_income"].max()) * 20)  # far outside the training range
for lti in lti_points:
    print(f"\n  loan_to_income = {lti:.2f}")
    for score in (300, 500, 600, 700, 800, 900):
        row = pd.DataFrame([{
            "income": 5_000_000,
            "loan_amount": lti * 5_000_000,
            "loan_to_income": lti,
            "cibil_score": score,
        }])[FEATURES]
        probs = best_model.predict_proba(row)[0]
        cls = int(best_model.predict(row)[0])
        print(f"    cibil={score}: class {cls} ({probs.max():.0%})")

joblib.dump(best_model, MODEL_PATH)

report_text += f"\nBest Model: {best_name}\n"
report_text += f"Best Accuracy: {best_accuracy:.4f}\n"

with open(REPORT_PATH, "w") as f:
    f.write(report_text)

# Metadata used by the API (/model-info and stored model_version)
with open(META_PATH, "w") as f:
    json.dump({
        "model_name": best_name,
        "model_version": MODEL_VERSION,
        "accuracy": round(float(best_accuracy), 4),
        "features": FEATURES,
        "target": "risk_level",
        "dataset": "Loan Approval Prediction Dataset",
        "report_file": "model_report.txt",
        "heavy_loan_to_income_threshold": round(LTI_HEAVY, 3),
        "very_heavy_loan_to_income_threshold": round(LTI_VERY_HEAVY, 3),
        "feature_ranges": {f: [float(df[f].min()), float(df[f].max())] for f in FEATURES},
        "label_rules": "Rejected = High; otherwise +1 if cibil < 700, +1 if loan_to_income >= heavy threshold, +2 if >= very heavy threshold (0 Low, 1 Medium, 2+ High)",
    }, f, indent=2)

print("\nTraining complete!")
print("Best Model:", best_name)
print("Accuracy:", round(best_accuracy, 4))
print("Model saved at:", MODEL_PATH)
print("Report saved at:", REPORT_PATH)
print("Metadata saved at:", META_PATH)