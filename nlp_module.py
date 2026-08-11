import pandas as pd
import numpy as np
import os
import joblib
import torch
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from torch.optim import AdamW
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import nltk
from nltk.corpus import stopwords
import re

# Download stopwords if not present
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# 1. Create Dummy Legal Text Data
def create_dummy_text_data(n_samples=1000):
    print("Generating simulated legal judgment texts...")
    
    grant_phrases = [
        "The applicant has deep roots in society and is not likely to flee from justice.",
        "Considering the period of incarceration, bail is granted.",
        "No prima facie case is made out against the accused at this stage.",
        "The investigation is complete and charge sheet has been filed.",
        "The accused is ready to furnish reliable sureties and cooperate with trial."
    ]
    
    reject_phrases = [
        "The allegations are of a very serious nature and societal impact is high.",
        "There is a strong possibility of the accused tampering with evidence.",
        "The accused has a criminal history and might repeat the offence.",
        "The prima facie involvement of the applicant is clearly established.",
        "Granting bail at this crucial stage of investigation would derail justice."
    ]

    np.random.seed(42)
    data = []
    
    for _ in range(n_samples):
        outcome = np.random.choice([0, 1]) # 0 = Reject, 1 = Grant
        if outcome == 1:
            # Grant
            base_text = " ".join(np.random.choice(grant_phrases, size=np.random.randint(2, 4), replace=False))
            text = f"Upon hearing the counsels, it is observed that {base_text.lower()} In view of the above, the bail application is allowed."
        else:
            # Reject
            base_text = " ".join(np.random.choice(reject_phrases, size=np.random.randint(2, 4), replace=False))
            text = f"Having perused the case diary, the court notes that {base_text.lower()} Therefore, the bail application stands rejected."
            
        data.append({"judgment_text": text, "target": outcome})
        
    df = pd.DataFrame(data)
    os.makedirs("data", exist_ok=True)
    df.to_csv("data/dummy_nlp_data.csv", index=False)
    return df

# 2. Text Preprocessing
def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)
    stop_words = set(stopwords.words('english'))
    # Keep some legal specific words from stopword exclusion if needed, but standard is fine
    words = text.split()
    words = [w for w in words if w not in stop_words and len(w) > 2]
    return " ".join(words)

class LegalDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len
        
    def __len__(self): return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        encoding = self.tokenizer(
            text, add_special_tokens=True, max_length=self.max_len,
            padding='max_length', truncation=True, return_tensors='pt'
        )
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def train_nlp_model(df):
    print("Preprocessing text data...")
    df['clean_text'] = df['judgment_text'].apply(clean_text)
    
    X_train, X_test, y_train, y_test = train_test_split(df['clean_text'], df['target'], test_size=0.2, random_state=42)
    
    print("Training NLP Classification Model (Transformer Fine-Tuning)...")
    model_name = "distilbert-base-uncased"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    
    train_dataset = LegalDataset(X_train.to_numpy(), y_train.to_numpy(), tokenizer)
    train_loader = DataLoader(train_dataset, batch_size=8, shuffle=True)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    optimizer = AdamW(model.parameters(), lr=2e-5)
    
    model.train()
    for batch in train_loader:
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        outputs = model(input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        loss.backward()
        optimizer.step()
        
    print("Model Training Complete. Saving Transformer...")
    os.makedirs("models/legal_bert", exist_ok=True)
    model.save_pretrained("models/legal_bert")
    tokenizer.save_pretrained("models/legal_bert")
    
    print("Extracting keywords using conventional ML...")
    tfidf_model = make_pipeline(TfidfVectorizer(max_features=1000, ngram_range=(1,2)), MultinomialNB())
    tfidf_model.fit(X_train, y_train)
    tfidf = tfidf_model.named_steps['tfidfvectorizer']
    nb = tfidf_model.named_steps['multinomialnb']
    
    feature_names = np.array(tfidf.get_feature_names_out())
    grant_log_prob = nb.feature_log_prob_[1]
    reject_log_prob = nb.feature_log_prob_[0]
    
    grant_keywords = feature_names[np.argsort(grant_log_prob)[::-1][:10]]
    reject_keywords = feature_names[np.argsort(reject_log_prob)[::-1][:10]]
    
    keywords_dict = {
        "grant_keywords": grant_keywords.tolist(),
        "reject_keywords": reject_keywords.tolist()
    }
    joblib.dump(keywords_dict, "models/nlp_keywords.pkl")
    print("NLP pipelines completed and saved.")

if __name__ == "__main__":
    df = create_dummy_text_data(n_samples=500)
    train_nlp_model(df)
