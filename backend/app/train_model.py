import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "loan_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "loan_model.pkl")
REPORT_PATH = os.path.join(BASE_DIR, "model_report.txt")

df = pd.read_csv(DATA_PATH)

# Remove hidden spaces from column names
df.columns = df.columns.str.strip()

print("Columns found:", df.columns.tolist())

# Clean text columns
df["loan_status"] = df["loan_status"].astype(str).str.strip()

# Keep only needed columns
df = df[["income_annum", "loan_amount", "loan_status"]].dropna()

# Rename for our app
df = df.rename(columns={
    "income_annum": "income"
})

# Feature engineering
df["loan_to_income"] = df["loan_amount"] / df["income"]

# Target mapping
df["risk"] = df["loan_status"].map({
    "Approved": 0,
    "Rejected": 2
})

df = df.dropna(subset=["risk"])

X = df[["income", "loan_amount", "loan_to_income"]]
y = df["risk"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
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

joblib.dump(best_model, MODEL_PATH)

report_text += f"\nBest Model: {best_name}\n"
report_text += f"Best Accuracy: {best_accuracy:.4f}\n"

with open(REPORT_PATH, "w") as f:
    f.write(report_text)

print("Training complete!")
print("Best Model:", best_name)
print("Accuracy:", round(best_accuracy, 4))
print("Model saved at:", MODEL_PATH)
print("Report saved at:", REPORT_PATH)