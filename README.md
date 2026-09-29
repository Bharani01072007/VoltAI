# VoltAI: AI-Based Electricity Consumption Prediction & Classification System

An end-to-end Machine Learning web application that predicts and classifies building electricity consumption into operational load tiers (**LOW**, **MEDIUM**, **HIGH**) based on environmental, temporal, and occupancy telemetry.

---

## 1. Project Title
**VoltAI - AI-Based Electricity Consumption Prediction & Classification System**

## 2. Problem Statement
Electricity consumption forecasting is essential for smart grid management, energy efficiency, and peak-load demand response. While energy usage prediction is traditionally formulated as a continuous regression problem, grid operators, automated HVAC controllers, and consumer energy dashboards require discrete operational action levels (**LOW**, **MEDIUM**, **HIGH**) to trigger load-shedding, storage dispatch, or peak-tariff warnings. 

This project formulates the domain task as **Electricity Consumption Level Classification** using statistical quantiles to ensure class balance and meaningful domain thresholds.

## 3. Objective
- Build an end-to-end machine learning pipeline from raw telemetry to deployed REST API and dynamic web UI.
- Formulate electricity usage classification using 33.3% quantiles to eliminate class imbalance.
- Train and evaluate three distinct machine learning model families (Logistic Regression, Random Forest, Support Vector Machine).
- Benchmark models using Accuracy, Precision (Macro), Recall (Macro), F1-score (Macro), and Multi-Class Confusion Matrices.
- Serialize the best-performing model pipeline using `joblib`.
- Serve inferences through a high-performance Python FastAPI backend.
- Connect the AI Studio React interface to the backend API.

## 4. Dataset
- **Source**: Hourly Smart Meter & Meteorological Telemetry Dataset (`data/electricity_consumption.csv`).
- **Total Records**: 12,000 hourly observations over ~500 calendar days.
- **Data Integrity**: 0 missing values, 0 duplicate rows.
- **Target Formulation**: Continuous consumption in kilowatt-hours (kWh) discretized into equal-frequency quantiles:
  - **LOW**: $\le 6.22\text{ kWh}$ ($33.4\%$ of dataset)
  - **MEDIUM**: $6.22\text{ kWh} - 11.00\text{ kWh}$ ($33.3\%$ of dataset)
  - **HIGH**: $> 11.00\text{ kWh}$ ($33.3\%$ of dataset)

## 5. Features
| Feature Name | Type | Range / Values | Description |
| :--- | :--- | :--- | :--- |
| `temperature` | Float | -5.0°C to 42.0°C | Ambient outdoor temperature |
| `humidity` | Float | 20.0% to 95.0% | Ambient relative humidity |
| `hour` | Integer | 0 to 23 | Hour of the day |
| `day` | Integer | 1 to 31 | Day of the month |
| `month` | Integer | 1 to 12 | Month of the year |
| `is_weekend` | Integer | 0 or 1 | Weekend indicator (Saturday/Sunday) |
| `occupancy` | Integer | 1 to 12 | Number of occupants present |
| `previous_consumption` | Float | 0.92 to 32.73 kWh | Lagged baseline consumption (t-1h) |
| `appliance_usage` | Integer | 0 to 15 | Active high-draw appliance units |

## 6. Target Classes
- **`LOW`**: Off-peak, minimal standby usage, low occupancy/appliance draw.
- **`MEDIUM`**: Standard daytime activity, moderate HVAC and appliance load.
- **`HIGH`**: Peak demand hours, high HVAC thermal load, simultaneous heavy appliance usage.

## 7. Methodology
1. **Data Acquisition & Synthesis**: Domain-grounded time-series generation with seasonal temperature variations, diurnal hour multipliers, and occupancy patterns.
2. **Exploratory Data Analysis**: Visualizing class distribution, diurnal load profiles, seasonal trends, and feature correlations.
3. **Preprocessing & Feature Engineering**: Standard scaling of numerical inputs within a leakage-free Scikit-learn Pipeline.
4. **Train/Test Stratified Split**: 80% Training (9,600 samples) and 20% Testing (2,400 samples).
5. **Model Training**: Logistic Regression, Random Forest Classifier, Support Vector Machine.
6. **Model Evaluation & Comparison**: Scoring on test split with Confusion Matrices and Macro F1 selection.
7. **Serialization & API Serving**: Joblib pipeline serialization & FastAPI REST server.
8. **Frontend Integration**: React + TypeScript interface connecting via `POST /predict`.

## 8. Exploratory Data Analysis (EDA)
Figures generated into `reports/figures/`:
- `target_distribution.png`: Equal distribution across LOW, MEDIUM, HIGH classes.
- `consumption_distribution.png`: Histogram showing continuous kWh distribution with quantile threshold markers.
- `hourly_analysis.png`: Diurnal load curve displaying morning (08:00-10:00) and evening peak (17:00-21:00) usage spikes.
- `daily_analysis.png`: Weekend vs weekday consumption shift.
- `monthly_analysis.png`: Summer cooling and winter heating load peaks.
- `correlation_matrix.png`: Heatmap showing strong positive correlations between consumption and temperature, previous consumption, and appliance count.

## 9. Preprocessing
- Preprocessing is encapsulated inside a Scikit-Learn `ColumnTransformer` and `Pipeline`.
- Numerical features are scaled using `StandardScaler`.
- **Data Leakage Prevention**: Transformers are fitted **only** on `X_train` during training. Transformation is applied dynamically during inference inside the serialized pipeline.

## 10. Algorithms
1. **Logistic Regression (Multinomial)**: Linear decision boundary baseline using L-BFGS solver.
2. **Random Forest Classifier**: Ensemble of 150 bagging decision trees with max depth 12.
3. **Support Vector Machine (SVC)**: Kernel machine utilizing Radial Basis Function (RBF) with probability estimation.

## 11. Evaluation Metrics
Models are evaluated on the 2,400 held-out test samples using:
- **Accuracy**: Overall fraction of correct predictions.
- **Precision (Macro)**: Unweighted average precision across LOW, MEDIUM, and HIGH classes.
- **Recall (Macro)**: Unweighted average recall across LOW, MEDIUM, and HIGH classes.
- **F1-Score (Macro)**: Primary selection metric balancing per-class sensitivity and precision.
- **Confusion Matrix**: 3x3 matrix highlighting exact misclassifications.

## 12. Model Comparison
*Actual calculated results from 2,400 test samples:*

| Model | Accuracy | Precision (Macro) | Recall (Macro) | F1-Score (Macro) | Latency | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | **0.9325** | **0.9326** | **0.9325** | **0.9325** | ~18.5 ms | **Selected Best** |
| **Support Vector Machine** | 0.9179 | 0.9178 | 0.9179 | 0.9178 | ~32.1 ms | Evaluated |
| **Logistic Regression** | 0.8775 | 0.8778 | 0.8774 | 0.8775 | ~3.2 ms | Evaluated |

## 13. Best Model
**Random Forest Classifier** achieved the top performance with **93.25% Macro F1-Score** and **93.25% Accuracy**. It captures non-linear interactions between ambient temperature extremes and active appliance counts effectively without overfitting.

## 14. Backend API
Built with Python FastAPI and Pydantic:
- `POST /predict`: Accepts feature JSON payload, passes through serialized pipeline, and returns prediction class, confidence score, and probability distribution.
- `GET /health`: Health check and model readiness state.
- `GET /model-info`: Returns model hyperparameters, features, and benchmark metrics.
- `GET /models`: Returns full comparison table data.
- `GET /analytics`: Serves diurnal hourly curves and category distributions.

## 15. Frontend
Built with React, TypeScript, and Vite:
- **Dashboard**: High-level system metrics, quick test presets, and live backend health ping.
- **Predict View**: Interactive feature sliders and inputs with live API error handling and confidence visualizations.
- **Analytics View**: Visualizing real load trends, hourly profiles, and feature importances.
- **Model Performance**: Multi-metric comparison table, candidate callout, and interactive confusion matrices.
- **About Project**: Complete system methodology and architecture walkthrough.

## 16. Installation

### Environment Requirements
- Python 3.10+
- Node.js 18+

### Python Virtual Environment & Packages
```bash
# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Install requirements
pip install -r backend/requirements.txt
```

### Frontend Dependencies
```bash
npm install
```

> **Note**: If you encounter an esbuild peer dependency error with older `npm` versions, use:
> ```bash
> npm install --legacy-peer-deps
> ```

## 17. Running Instructions

### Step 1: Data Generation & Model Training
```bash
# Generate dataset
python scripts/generate_dataset.py

# Perform EDA
python scripts/eda.py

# Train & evaluate models (saves model to backend/model/electricity_prediction_model.pkl)
python scripts/train_models.py
```

### Step 2: Start Backend API Server
```bash
cd backend
python app.py
# Or: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Step 3: Start Frontend Client
```bash
# In project root
npm run dev
```
Open browser at `http://localhost:3000`.

## 18. Testing
Run automated backend pytest suite:
```bash
pytest tests/test_api.py -v
```
Test suite verifies 9 test cases covering LOW, MEDIUM, HIGH predictions, out-of-bounds inputs (422 rejection), missing fields, boundary values, and API health endpoints.

## 19. Project Structure
```
VoltAI/
├── backend/
│   ├── app.py                      # FastAPI application
│   ├── schemas.py                  # Pydantic schemas
│   ├── services/
│   │   └── prediction_service.py   # Joblib model inference service
│   ├── model/
│   │   ├── electricity_prediction_model.pkl  # Serialized pipeline
│   │   └── metadata.json           # Model metadata
│   ├── requirements.txt
│   └── README.md
├── data/
│   └── electricity_consumption.csv # Dataset (12,000 samples)
├── reports/
│   ├── figures/                    # Saved EDA & confusion matrix plots
│   ├── model_results.csv           # Model evaluation results
│   └── PROJECT_REPORT.md           # Formal academic report
├── scripts/
│   ├── generate_dataset.py         # Dataset generation
│   ├── eda.py                      # EDA pipeline
│   └── train_models.py             # ML model training & evaluation
├── src/                            # React + TypeScript frontend
│   ├── components/                 # UI & Chart components
│   ├── services/                   # API Client & Services
│   ├── types/                      # TypeScript definitions
│   └── App.tsx
├── tests/
│   └── test_api.py                 # Pytest test suite
├── README.md                       # Main Documentation
└── requirements.txt
```

## 20. Future Enhancements
- Integration of ONNX Runtime for ultra-low latency inference (< 5 ms).
- Deep learning time-series architectures (LSTM / Temporal Fusion Transformers) for continuous multi-hour forecasting.
- Real-time IoT MQTT smart meter socket streaming integration.
