import pandas as pd
import numpy as np
import os
import joblib
import logging
from sentence_transformers import SentenceTransformer
import faiss

# Suppress the known harmless warning:
# "embeddings.position_ids | UNEXPECTED" appears when loading BertModel
# checkpoints saved with older transformers versions. The key is a deprecated
# buffer that newer versions no longer store — the model loads correctly.
logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
logging.getLogger("transformers.modeling_utils").setLevel(logging.ERROR)

class PrecedentIndex:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.index = None
        self.metadata = None
        
    def build_index(self, csv_path, n_samples=5000):
        print(f"Building Precedent Index from {csv_path}...")
        # Load data
        cols = ['COURT_NAME', 'CASETYPE_FULLFORM', 'NJDG_JUDGE_NAME', 'Mapped_Bail', 'UNDER_ACTS', 'UNDER_SECTIONS']
        df = pd.read_csv(csv_path, usecols=lambda x: x in cols, nrows=n_samples * 5) # Load more to sample
        df = df.dropna(subset=['COURT_NAME', 'CASETYPE_FULLFORM']).sample(n=min(n_samples, len(df)), random_state=42)
        
        # Create descriptive strings for embedding
        def create_text(row):
            parts = []
            if pd.notna(row.get('COURT_NAME')): parts.append(f"Court: {row['COURT_NAME']}")
            if pd.notna(row.get('CASETYPE_FULLFORM')): parts.append(f"Case Type: {row['CASETYPE_FULLFORM']}")
            if pd.notna(row.get('UNDER_ACTS')): parts.append(f"Acts: {row['UNDER_ACTS']}")
            if pd.notna(row.get('UNDER_SECTIONS')): parts.append(f"Sections: {row['UNDER_SECTIONS']}")
            if pd.notna(row.get('Mapped_Bail')): parts.append(f"Outcome: {row['Mapped_Bail']}")
            return " | ".join(parts)
            
        texts = df.apply(create_text, axis=1).tolist()
        self.metadata = df.to_dict('records')
        
        # Embed
        embeddings = self.model.encode(texts, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')
        
        # FAISS Index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(embeddings)
        
        # Save
        os.makedirs("models/precedents", exist_ok=True)
        faiss.write_index(self.index, "models/precedents/precedents.index")
        joblib.dump(self.metadata, "models/precedents/metadata.pkl")
        print("Precedent Index saved successfully.")

    def load_index(self):
        if os.path.exists("models/precedents/precedents.index"):
            self.index = faiss.read_index("models/precedents/precedents.index")
            self.metadata = joblib.load("models/precedents/metadata.pkl")
            return True
        return False

    def search(self, query_text, top_k=5):
        if self.index is None:
            if not self.load_index():
                return []
        
        query_embedding = self.model.encode([query_text]).astype('float32')
        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if idx != -1:
                item = self.metadata[idx]
                item['similarity_score'] = float(1 / (1 + dist)) # Convert distance to score
                results.append(item)
        return results

if __name__ == "__main__":
    # Initialize and build if data exists
    csv_path = "DATASETS/Compiled Bail case data.csv"
    if os.path.exists(csv_path):
        idx = PrecedentIndex()
        idx.build_index(csv_path)
    else:
        print("Data file not found.")
