"""
ML Model Training Script
Trains a Random Forest Classifier within a Scikit-Learn Pipeline
for investment product recommendations.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, f1_score, confusion_matrix

def train_investment_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'data', 'synthetic_investment_data.csv')

    # If dataset doesn't exist yet, generate it
    if not os.path.exists(data_path):
        from data.generate_dataset import generate_investment_dataset
        print("Generating synthetic dataset...")
        df = generate_investment_dataset(3200)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    print(f"Loaded dataset with {len(df)} samples.")

    # Features and Target
    feature_cols = [
        'age', 
        'monthly_income', 
        'current_savings', 
        'planned_investment', 
        'investment_duration', 
        'risk_tolerance', 
        'financial_goal',
        'employment_category'
    ]
    target_col = 'recommended_category'

    X = df[feature_cols]
    y = df[target_col]

    numerical_features = ['age', 'monthly_income', 'current_savings', 'planned_investment', 'investment_duration']
    categorical_features = ['risk_tolerance', 'financial_goal', 'employment_category']

    # Preprocessing Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ]
    )

    # Full model pipeline
    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=150,
            max_depth=14,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        ))
    ])

    # Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("Training Random Forest Classifier pipeline...")
    clf.fit(X_train, y_train)

    # Evaluation
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='weighted')
    report = classification_report(y_test, y_pred, output_dict=True)
    labels = sorted(list(y.unique()))
    cm = confusion_matrix(y_test, y_pred, labels=labels).tolist()

    print(f"Training complete.")
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print(f"Test Weighted F1: {f1:.4f}")

    # Prepare metadata
    metadata = {
        'model_type': 'RandomForestClassifier (Pipeline)',
        'accuracy': round(float(acc), 4),
        'f1_weighted': round(float(f1), 4),
        'n_estimators': 150,
        'max_depth': 14,
        'features': feature_cols,
        'numerical_features': numerical_features,
        'categorical_features': categorical_features,
        'classes': labels,
        'train_samples': len(X_train),
        'test_samples': len(X_test),
        'confusion_matrix': cm,
        'classification_report': report,
        'disclaimer': 'Model trained on illustrative synthetic data for educational demonstration.'
    }

    # Save destinations
    saved_models_dir = os.path.join(current_dir, 'saved_models')
    os.makedirs(saved_models_dir, exist_ok=True)
    model_save_path = os.path.join(saved_models_dir, 'investment_rf_model.joblib')
    metadata_save_path = os.path.join(saved_models_dir, 'model_metadata.json')

    joblib.dump(clf, model_save_path)
    with open(metadata_save_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    # Also sync to backend/app/ml/ for runtime loading
    backend_ml_dir = os.path.join(current_dir, '..', 'backend', 'app', 'ml')
    os.makedirs(backend_ml_dir, exist_ok=True)
    joblib.dump(clf, os.path.join(backend_ml_dir, 'investment_rf_model.joblib'))
    with open(os.path.join(backend_ml_dir, 'model_metadata.json'), 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)

    print(f"Model saved successfully to:\n- {model_save_path}\n- {os.path.join(backend_ml_dir, 'investment_rf_model.joblib')}")
    return metadata

if __name__ == '__main__':
    train_investment_model()
