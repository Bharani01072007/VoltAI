# VoltAI Backend API

FastAPI REST service for AI-Based Electricity Consumption Prediction System.

## Architecture

```
backend/
├── app.py                      # Main FastAPI application routes & middleware
├── schemas.py                  # Pydantic request & response schemas
├── services/
│   ├── __init__.py
│   └── prediction_service.py   # Joblib model loader and inference engine
├── model/
│   ├── electricity_prediction_model.pkl  # Serialized scikit-learn Pipeline
│   └── metadata.json           # Evaluation metrics & model metadata
├── requirements.txt
└── README.md
```

## API Endpoints

- `GET /health` - Returns server status and model loading state.
- `POST /predict` - Accepts input features and returns consumption level prediction, confidence, and class probabilities.
- `GET /model-info` - Returns model name, features, target classes, and metrics.
- `GET /models` - Returns comparison metrics for all trained models.
- `GET /analytics` - Returns target distribution, hourly/monthly breakdown, and feature importances.

## How to Run

```bash
# Activate virtual environment
..\.venv\Scripts\activate

# Launch Uvicorn dev server
python app.py
# Or using uvicorn directly
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
