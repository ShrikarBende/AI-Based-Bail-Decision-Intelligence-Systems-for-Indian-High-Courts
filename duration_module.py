import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error
try:
    import xgboost as xgb
except ImportError:
    xgb = None
import joblib
import os
import matplotlib.pyplot as plt
import seaborn as sns

def load_data(filepath, n_rows=None):
    print(f"Loading data from {filepath}...")
    # Memory optimization: only load required columns
    cols_to_use = ['COURT_NAME', 'NJDG_JUDGE_NAME', 'CASETYPE_FULLFORM', 'DISPOSAL_DAYS...1']
    df = pd.read_csv(filepath, nrows=n_rows, usecols=lambda c: c in cols_to_use)
    return df

def preprocess_duration_data(df):
    print("Preprocessing duration data...")
    # Target for duration: PENDING_DAYS or DISPOSAL_DAYS
    # We'll use DISPOSAL_DAYS...1 as a proxy for total case duration of disposed cases.
    
    required_cols = ['COURT_NAME', 'NJDG_JUDGE_NAME', 'CASETYPE_FULLFORM', 'DISPOSAL_DAYS...1']
    
    available_cols = [c for c in required_cols if c in df.columns]
    df = df[available_cols].copy()
    
    # Drop rows where target (duration) is missing
    target_col = 'DISPOSAL_DAYS...1'
    if target_col in df.columns:
        # Convert to numeric, errors='coerce' to turn bad strings into NaNs, then drop
        df[target_col] = pd.to_numeric(df[target_col], errors='coerce')
        df = df.dropna(subset=[target_col])
    else:
        print("Warning: Target duration column not found.")
        return None, None

    # Handle Missing Values in Features
    for col in df.columns:
        if col != target_col:
            if df[col].dtype == 'object':
                df[col] = df[col].fillna("UNKNOWN")
            else:
                df[col] = df[col].fillna(0)
                
    # Reuse or create encoders for specific columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    encoders = {}
    
    # We will load the previously saved encoders if they exist, otherwise create new
    encoder_path = "models/label_encoders.pkl"
    if os.path.exists(encoder_path):
        saved_encoders = joblib.load(encoder_path)
    else:
        saved_encoders = {}
        
    for col in categorical_cols:
        from sklearn.preprocessing import LabelEncoder
        if col in saved_encoders:
            le = saved_encoders[col]
            # Transform, handling unseen labels by assigning a specific value (-1 or default)
            # Simple approach for demonstration:
            df[col] = df[col].astype(str)
            # Find unseen labels and replace them with a known generic if possible, or refit (not ideal for strict prod)
            # For simplicity in this demo, we refit the encodings for time analytics if strictly needed, 
            # but ideally we align them. Let's just create independent encoders for the time model for safety right now.
        
        le = LabelEncoder()
        df[col] = df[col].astype(str)
        df[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    os.makedirs("models", exist_ok=True)
    joblib.dump(encoders, "models/time_model_encoders.pkl")
    
    return df, target_col

def train_duration_model(df, target_col):
    X = df.drop(columns=[target_col])
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Regressor for Case Duration...")
    if xgb is not None:
        model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
    else:
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mae = mean_absolute_error(y_test, preds)
    
    print(f"Model Evaluation - RMSE: {rmse:.2f} days, MAE: {mae:.2f} days")
    
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/duration_prediction_model.pkl")
    
    # Basic EDA logic extraction for Dashboard
    # We save a summary CSV.
    if 'COURT_NAME' in X.columns and 'time_model_encoders.pkl' in os.listdir("models"):
        # Not strictly decoding back here, assuming dashboard will handle raw data EDA
        pass
        
    print("Duration model saved.")
    return model

if __name__ == "__main__":
    # Using the complete compiled dataset
    df = load_data("DATASETS/Compiled Bail case data.csv", n_rows=None) 
    processed_df, target_col = preprocess_duration_data(df)
    
    if processed_df is not None:
        train_duration_model(processed_df, target_col)
        print("Time Analytics pipeline completed.")
