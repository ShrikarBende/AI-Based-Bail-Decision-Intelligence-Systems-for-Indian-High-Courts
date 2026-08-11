# AI-Based Bail Decision Intelligence System for Indian High Courts

An advanced, end-to-end decision intelligence platform designed to analyze, predict, and optimize bail outcomes in the Indian judicial system. The platform combines machine learning models (for bail and duration prediction), NLP models (Legal-BERT for text analysis), and Large Language Models (Groq Llama 3 / Google Gemini for statutory analysis and document drafting) to assist legal practitioners and researchers.

## 📸 Screenshots

**AI-Powered Bail Prediction Platform — Home**

![Platform Home](Screenshots/Screenshot%202026-05-21%20214453.png)

**CasePredictAI — Legal Analysis Assistant**

![CasePredictAI](Screenshots/Screenshot%202026-05-21%20214549.png)

## 🚀 Key Features

* Bail Grant/Reject Prediction: Machine learning pipeline using local models to estimate the probability of a bail grant, with local SHAP explanation showing top impacting factors.
* Duration Estimation: Estimates case pending duration in days based on court name, judge name, and case type.
* NLP Document Analysis: Integrates a local fine-tuned Legal-BERT model for analyzing petition text and highlighting key grant/reject triggers.
* Precedent Search: Vector-based precedent search indexing historical cases and summarizing insights using LLMs.
* Kanoon AI Chat: A conversational assistant tailored for Indian law research (IPC, BNS, CrPC, BNSS, and Supreme Court precedents).
* DocHub (Automated Drafting): AI-powered legal document drafter producing complete court drafts and detailed attorney notes.
* Fairness & Bias Audit: Analyzes disparate impact across High Courts to identify systemic variance or bias.
* Secure Auth System: Complete registration and login system utilizing SQLite database, custom bcrypt password hashing, and JWT tokens.

## 📁 Repository Structure

The project separates the backend code (Python/FastAPI) at the root level and the frontend code (React/Vite) under the `frontend` folder:

```
├── frontend/                     # React + Vite frontend application
│   ├── src/                      # UI components and state logic
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build configuration
├── Screenshots/                  # Platform screenshots used in this README
├── data/                         # Preprocessed datasets (SQLite DB and local CSVs)
├── models/                       # Pretrained ML & NLP weights (local models, encoders)
├── api.py                        # FastAPI server entry point and endpoint routes
├── app.py                        # Backend application controller
├── legal_constants.py            # Static Indian legal definitions & statutory defenses
├── requirements.txt              # Python packages for backend runtime
├── .gitignore                    # Excludes secrets, local DBs, and files > 100MB
└── .env.example                  # Template configuration for environment variables

```

## 🛠️ Setup & Installation

### Backend Setup (Python / FastAPI)

1. Clone the repository:

```
git clone https://github.com/ShrikarBende/AI-Based-Bail-Decision-Intelligence-Systems-for-Indian-High-Courts.git
cd AI-Based-Bail-Decision-Intelligence-Systems-for-Indian-High-Courts
```

2. Create a virtual environment and activate it:

```
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Configure environment variables:
   * Copy the `.env.example` file to `.env`:

```
copy .env.example .env
```

   * Fill in your API keys in the `.env` file (e.g., `GROQ_API_KEY`, `GEMINI_API_KEY`).

5. Run the API server:

```
uvicorn api:app --reload --port 8000
```

   * The backend API will be available at `http://localhost:8000`.
   * Access interactive Swagger docs at `http://localhost:8000/docs`.

### Frontend Setup (React / Vite)

1. Navigate to the frontend folder:

```
cd frontend
```

2. Install node dependencies:

```
npm install
```

3. Run the local development server:

```
npm run dev
```

   * The React application will be running at `http://localhost:5173`.
