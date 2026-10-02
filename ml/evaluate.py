"""
Model Evaluation Script
Loads the trained Random Forest Pipeline and outputs detailed performance metrics.
"""

import os
import json
import joblib
import pandas as pd
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

def evaluate_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'saved_models', 'investment_rf_model.joblib')
    data_path = os.path.join(current_dir, 'data', 'synthetic_investment_data.csv')

    if not os.path.exists(model_path):
        print("Model file not found. Running training first...")
        from train import train_investment_model
        train_investment_model()

    model = joblib.load(model_path)
    df = pd.read_csv(data_path)

    feature_cols = [
        'age', 'monthly_income', 'current_savings', 
        'planned_investment', 'investment_duration', 
        'risk_tolerance', 'financial_goal', 'employment_category'
    ]
    X = df[feature_cols]
    y = df['recommended_category']

    y_pred = model.predict(X)
    acc = accuracy_score(y, y_pred)

    print("=" * 60)
    print("INVESTMENT RECOMMENDATION ML MODEL EVALUATION REPORT")
    print("=" * 60)
    print(f"Overall Dataset Accuracy: {acc * 100:.2f}%\n")
    print("Detailed Classification Report:")
    print(classification_report(y, y_pred, digits=4))
    
    classes = sorted(list(y.unique()))
    cm = confusion_matrix(y, y_pred, labels=classes)
    cm_df = pd.DataFrame(cm, index=classes, columns=classes)
    print("\nConfusion Matrix:")
    print(cm_df)
    print("=" * 60)

if __name__ == '__main__':
    evaluate_model()
