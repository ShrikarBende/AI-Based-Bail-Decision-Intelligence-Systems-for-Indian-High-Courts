import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import RandomizedSearchCV
try:
    import xgboost as xgb
except ImportError:
    print("XGBoost not installed. Using Random Forest only.")
    xgb = None
import joblib
import os
import shap

def train_and_evaluate_models(X_train, y_train, X_test, y_test):
    print("Training Random Forest on full dataset...")
    # Using optimized parameters directly to handle massive data efficiently without GridSearch explosion
    rf_model = RandomForestClassifier(n_estimators=50, max_depth=None, min_samples_split=2, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    
    print("Evaluating Tuned Random Forest...")
    rf_preds = rf_model.predict(X_test)
    print("Accuracy:", accuracy_score(y_test, rf_preds))
    print(classification_report(y_test, rf_preds))
    
    best_model = rf_model
    model_name = "random_forest"
    
    if xgb is not None:
        print("Training XGBoost on full dataset...")
        xgb_model = xgb.XGBClassifier(n_estimators=200, max_depth=10, learning_rate=0.01, use_label_encoder=False, eval_metric='logloss', random_state=42, n_jobs=-1)
        xgb_model.fit(X_train, y_train)
        
        print("Evaluating Tuned XGBoost...")
        xgb_preds = xgb_model.predict(X_test)
        xgb_acc = accuracy_score(y_test, xgb_preds)
        print("Accuracy:", xgb_acc)
        print(classification_report(y_test, xgb_preds))
        
        if xgb_acc >= accuracy_score(y_test, rf_preds):
            best_model = xgb_model
            model_name = "xgboost"

    print(f"\nSaving best model ({model_name})...")
    os.makedirs("models", exist_ok=True)
    joblib.dump(best_model, "models/bail_outcome_model.pkl")
    
    return best_model, model_name

def generate_shap_explainer(model, X_train, model_name):
    print("Generating SHAP Explainer...")
    if model_name == "random_forest":
        explainer = shap.TreeExplainer(model)
    elif model_name == "xgboost":
        explainer = shap.TreeExplainer(model)
    else:
        # Fallback
        explainer = shap.Explainer(model, X_train)
        
    os.makedirs("models", exist_ok=True)
    joblib.dump(explainer, "models/shap_explainer.pkl")
    print("SHAP Explainer saved.")

if __name__ == "__main__":
    print("Loading preprocessed data...")
    if not os.path.exists("data/X_train.csv"):
        print("Error: data/X_train.csv not found. Run data_preprocessing.py first.")
        exit(1)
        
    X_train = pd.read_csv("data/X_train.csv")
    y_train = pd.read_csv("data/y_train.csv").values.ravel()
    X_test = pd.read_csv("data/X_test.csv")
    y_test = pd.read_csv("data/y_test.csv").values.ravel()
    
    best_model, model_name = train_and_evaluate_models(X_train, y_train, X_test, y_test)
    generate_shap_explainer(best_model, X_train, model_name)
    print("Model training pipeline completed successfully.")
