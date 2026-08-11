import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os
import shap
import matplotlib.pyplot as plt
import plotly.express as px
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

# Apply basic config
st.set_page_config(page_title="Bail Decision Intelligence", layout="wide")

# Custom Styling (Rich Aesthetics)
st.markdown("""
<style>
    .main {
        background-color: #f4f6f9;
        font-family: 'Inter', sans-serif;
    }
    .stButton>button {
        background-color: #0056b3;
        color: white;
        border-radius: 8px;
        padding: 10px 24px;
        font-weight: bold;
        transition: 0.3s;
    }
    .stButton>button:hover {
        background-color: #004494;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    h1, h2, h3 {
        color: #1e293b;
    }
    .metric-card {
        background-color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        text-align: center;
        border-top: 4px solid #0056b3;
    }
    .grant-text { color: #10b981; font-weight: bold; }
    .reject-text { color: #ef4444; font-weight: bold; }
</style>
""", unsafe_allow_html=True)

# ---------------- Load Models & Artifacts ----------------

@st.cache_resource
def load_ml_models():
    model_path = "models/bail_outcome_model.pkl"
    encoder_path = "models/label_encoders.pkl"
    shap_path = "models/shap_explainer.pkl"
    
    model = joblib.load(model_path) if os.path.exists(model_path) else None
    encoders = joblib.load(encoder_path) if os.path.exists(encoder_path) else None
    explainer = joblib.load(shap_path) if os.path.exists(shap_path) else None
    
    return model, encoders, explainer

@st.cache_resource
def load_time_model():
    model_path = "models/duration_prediction_model.pkl"
    encoder_path = "models/time_model_encoders.pkl"
    
    model = joblib.load(model_path) if os.path.exists(model_path) else None
    encoders = joblib.load(encoder_path) if os.path.exists(encoder_path) else None
    return model, encoders

@st.cache_resource
def load_nlp_model():
    keywords_path = "models/nlp_keywords.pkl"
    keywords = joblib.load(keywords_path) if os.path.exists(keywords_path) else None

    # Load HuggingFace model
    model_path = "models/legal_bert"
    if os.path.exists(model_path):
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        model = AutoModelForSequenceClassification.from_pretrained(model_path)
        nlp_pipeline = pipeline("text-classification", model=model, tokenizer=tokenizer)
        return nlp_pipeline, keywords
    return None, keywords


ml_model, ml_encoders, shap_explainer = load_ml_models()
time_model, time_encoders = load_time_model()
nlp_model, nlp_keywords = load_nlp_model()


# ---------------- UI Structure ----------------

st.title("⚖️ AI-Based Bail Decision Intelligence System")
st.markdown("An intelligent, data-driven decision support tool for Indian High Courts predicting outcomes, analyzing case duration, and extracting legal reasoning.")

tabs = st.tabs(["📊 ML: Bail Outcome Prediction", "⏱️ Time Analytics", "📄 NLP: Legal Text Analysis"])

# ---- Tab 1: ML Validation ----
with tabs[0]:
    st.header("Bail Outcome Prediction")
    st.markdown("Enter case metadata to predict whether bail is likely to be **Granted** or **Rejected**.")
    
    if ml_model and ml_encoders:
        col1, col2 = st.columns(2)
        
        input_data = {}
        for idx, (col_name, encoder) in enumerate(ml_encoders.items()):
            target_col = col1 if idx % 2 == 0 else col2
            
            # Since generating a huge selectbox for Court/Judge names can freeze the UI, we take a text input and map it as close as possible, or use a dropdown of top known classes.
            known_classes = list(encoder.classes_)
            # Limit classes for frontend if too large
            if len(known_classes) > 100:
                known_classes = known_classes[:100] + ["..."] 
                
            val = target_col.selectbox(f"{col_name.replace('_', ' ').title()}", options=known_classes)
            
            if val == "...": val = known_classes[0] # Fallback
            
            try:
                enc_val = encoder.transform([str(val)])[0]
            except ValueError:
                # Handle unknown inputs
                enc_val = 0 
                
            input_data[col_name] = enc_val
            
        # Add numeric fields (Assuming PENDING_DAYS is a feature based on preprocessing script)
        # We check what is missing from encoders but was in required columns
        # (COURT_NAME, NJDG_JUDGE_NAME, CASETYPE_FULLFORM, PENDING_DAYS)
        input_data['PENDING_DAYS'] = col1.number_input("Pending Days", min_value=0, value=30)
        
        # In preprocess we mapped DISPOSAL_DAYS...1
        # But we only need what's inside X_train. 
        # Check specific expected columns to align exactly with model
        try:
            expected_features = ml_model.feature_names_in_ if hasattr(ml_model, 'feature_names_in_') else []
        except:
            expected_features = list(input_data.keys()) # Fallback
            
        if st.button("Predict Bail Outcome", key="ml_predict"):
            # Construct DataFrame
            df_input = pd.DataFrame([input_data])
            # Ensure column order matches training
            if len(expected_features) > 0:
                for col in expected_features:
                    if col not in df_input.columns:
                        df_input[col] = 0 # Assume 0 if unexpected missing feature
                df_input = df_input[expected_features]
            
            # Predict
            prob = ml_model.predict_proba(df_input)[0]
            pred = np.argmax(prob)
            
            st.markdown("---")
            if pred == 1:
                st.markdown(f"### Outcome: <span class='grant-text'>LIKELY GRANTED</span> (Confidence: {prob[1]:.1%})", unsafe_allow_html=True)
            else:
                st.markdown(f"### Outcome: <span class='reject-text'>LIKELY REJECTED</span> (Confidence: {prob[0]:.1%})", unsafe_allow_html=True)
                
            # Explainability
            if shap_explainer:
                st.subheader("Feature Importance (SHAP)")
                # Fast prediction explanation
                shap_values = shap_explainer(df_input)
                # For simplified UI, plot a bar chart of SHAP values
                fig, ax = plt.subplots(figsize=(8, 4))
                shap.plots.bar(shap_values[0], show=False)
                st.pyplot(fig)
    else:
        st.warning("ML Models not found. Please ensure the pipeline has been executed.")


# ---- Tab 2: Time Analytics ----
with tabs[1]:
    st.header("Case Duration Analysis")
    st.markdown("Estimate expected resolution times and explore time trends across different courts.")
    
    if time_model and time_encoders:
        col1, col2 = st.columns(2)
        
        t_input_data = {}
        for idx, (col_name, encoder) in enumerate(time_encoders.items()):
            target_col = col1 if idx % 2 == 0 else col2
            known_classes = list(encoder.classes_)[:50]
            val = target_col.selectbox(f"Select {col_name.replace('_', ' ').title()} (Time)", options=known_classes, key=f"time_{col_name}")
            
            try:
                enc_val = encoder.transform([str(val)])[0]
            except ValueError:
                enc_val = 0
            t_input_data[col_name] = enc_val
            
        if st.button("Predict Expected Duration", key="time_predict"):
            df_t_input = pd.DataFrame([t_input_data])
            
            try:
                t_expected_features = time_model.feature_names_in_ if hasattr(time_model, 'feature_names_in_') else list(df_t_input.columns)
                for col in t_expected_features:
                    if col not in df_t_input.columns:
                        df_t_input[col] = 0
                df_t_input = df_t_input[t_expected_features]
                
                duration_pred = time_model.predict(df_t_input)[0]
                
                st.markdown("---")
                st.markdown(f"""
                <div class='metric-card'>
                    <h3 style='margin:0;'>Estimated Disposal Duration</h3>
                    <h1 style='color:#0056b3; font-size:48px; margin:10px 0;'>{int(duration_pred)} Days</h1>
                    <p style='color:#64748b;'>Based on historical patterns for similar cases.</p>
                </div>
                """, unsafe_allow_html=True)
            except Exception as e:
                st.error(f"Error making prediction: {e}")
    else:
        st.warning("Time Analytics models not found.")
        
    st.markdown("---")
    st.markdown("### Court Efficiency Visual Insights")
    data_path = "DATASETS/Compiled Bail case data.csv"
    if os.path.exists(data_path):
        try:
            df_chart = pd.read_csv(data_path, nrows=5000)
            if 'DISPOSAL_YEAR' in df_chart.columns and 'DISPOSAL_DAYS...1' in df_chart.columns:
                fig = px.histogram(df_chart, x='DISPOSAL_YEAR', y='DISPOSAL_DAYS...1', 
                                   color='Mapped_Bail', histfunc='avg', barmode='group',
                                   title="Average Disposal Days Over Time (5000 Sample)",
                                   color_discrete_sequence=px.colors.qualitative.Pastel)
                st.plotly_chart(fig, use_container_width=True)
                
                # Additional court-wise chart
                fig2 = px.box(df_chart, x='COURT_NAME', y='DISPOSAL_DAYS...1', color='Mapped_Bail', title="Disposal Days Spread Across Various Courts")
                st.plotly_chart(fig2, use_container_width=True)
        except Exception as e:
            st.error("Could not load dataset for visualization.")


# ---- Tab 3: NLP Module ----
with tabs[2]:
    st.header("Legal Text Analysis")
    st.markdown("Analyze judgment texts to classify outcomes and extract common reasoning patterns.")
    
    if nlp_model and nlp_keywords:
        st.info("Using Hugging Face Transformer Pipeline.")
        text_input = st.text_area("Paste Judgment Text or Case Summary:", height=200, placeholder="e.g., The investigation is complete and charge sheet has been filed...")
        
        if st.button("Analyze Text", key="nlp_analyze"):
            if text_input.strip() == "":
                st.warning("Please enter some text.")
            else:
                from nlp_module import clean_text
                c_text = clean_text(text_input)
                
                result = nlp_model(c_text, truncation=True, max_length=512)[0]
                pred_label = "Grant" if result['label'] == 'LABEL_1' else "Reject"
                color = "grant-text" if pred_label == "Grant" else "reject-text"
                score = result['score']
                
                st.markdown(f"### Model Prediction: <span class='{color}'>{pred_label.upper()}</span> (Confidence: {score:.1%})", unsafe_allow_html=True)
                
                st.markdown("---")
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("#### Frequent Keywords in Grant Outcomes")
                    st.write(", ".join(nlp_keywords.get('grant_keywords', [])))
                with col2:
                    st.markdown("#### Frequent Keywords in Reject Outcomes")
                    st.write(", ".join(nlp_keywords.get('reject_keywords', [])))
    else:
        st.warning("NLP Models not found.")
