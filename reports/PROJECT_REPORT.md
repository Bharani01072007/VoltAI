# Comprehensive Project Report: AI-Based Electricity Consumption Prediction & Classification System

---

## Abstract
Accurate electricity consumption forecasting is a vital component of modern smart grid infrastructure, building energy management systems (BEMS), and demand-response automation. Although energy consumption is inherently a continuous temporal magnitude (measured in kilowatt-hours), operational decision-making in power grids and consumer management applications requires discrete load classification levels (**LOW**, **MEDIUM**, **HIGH**) to dynamically adjust HVAC setpoints, trigger battery storage dispatch, and issue peak-tariff notifications.

This report presents the design, implementation, evaluation, and deployment of **VoltAI**, an end-to-end Machine Learning system for **Electricity Consumption Level Classification**. Using a dataset of 12,000 hourly smart meter observations paired with meteorological and occupancy parameters, target class boundaries were established using statistical 33.3% quantiles ($\le 6.22\text{ kWh}$ for LOW, $6.22 - 11.00\text{ kWh}$ for MEDIUM, $> 11.00\text{ kWh}$ for HIGH) to eliminate class imbalance. Three distinct machine learning model families—Logistic Regression, Support Vector Machine (RBF Kernel), and Random Forest Classifier—were trained using Scikit-Learn pipelines. On a held-out test split of 2,400 samples, **Random Forest Classifier** achieved the best overall performance with **93.25% Macro F1-Score** and **93.25% Accuracy**. The trained pipeline was serialized using `joblib` and served via a Python FastAPI REST backend integrated with a React/TypeScript interface. Automated pytest suites verified zero-defect inference handling across low, medium, high, and boundary edge cases.

---

## Introduction
Building energy management systems (BEMS) account for over 40% of global electricity demand. With the growth of renewable energy integration and dynamic electricity pricing, predictive analytics have transitioned from passive historical reporting to active real-time load control. 

This project delivers a complete machine learning workflow—encompassing dataset acquisition, exploratory analysis, preprocessing, algorithm benchmarking, pipeline serialization, REST API construction, frontend integration, and rigorous unit testing.

---

## Problem Statement
Predicting exact continuous kilowatt-hour values can lead to over-sensitivity in automated control loops (e.g., oscillating HVAC fans on small fractional fluctuations). Discrete operational tiers enable clear rule-based control policies. However, dividing continuous energy data into arbitrary fixed cutoffs often creates severe class imbalance (e.g., 90% medium, 5% low, 5% high), which degrades classifier generalization.

To resolve this challenge, the problem is formulated as **Electricity Consumption Level Classification** using equal-frequency consumption quantiles.

---

## Objectives
1. Acquire/generate a 12,000-sample hourly electricity consumption dataset with realistic thermal, diurnal, and occupancy characteristics.
2. Implement quantile-based target class discretization to achieve balanced representation across LOW, MEDIUM, and HIGH classes.
3. Conduct Exploratory Data Analysis (EDA) and save key diagnostic charts (`reports/figures/`).
4. Build data leakage-free Scikit-Learn pipelines incorporating standard scaling and model estimators.
5. Train and evaluate three classification algorithms: Logistic Regression, Random Forest, and Support Vector Machine.
6. Benchmark models using Accuracy, Precision (Macro), Recall (Macro), F1-Score (Macro), and 3x3 Confusion Matrices.
7. Select the optimal model based on empirical evaluation results.
8. Serialize the complete pipeline via `joblib`.
9. Develop a Python FastAPI backend serving `/predict`, `/health`, `/model-info`, `/models`, and `/analytics`.
10. Integrate the existing React Vite frontend with the live backend API.
11. Perform automated unit testing with unseen input data scenarios.

---

## Dataset Description
The dataset contains 12,000 hourly observations spanning ~500 calendar days. 

### Features Overview
- `temperature` (Float): Outdoor ambient temperature in °C (-5.0°C to 42.0°C).
- `humidity` (Float): Outdoor relative humidity percentage (20.0% to 95.0%).
- `hour` (Integer): Diurnal hour of day (0 to 23).
- `day` (Integer): Calendar day of month (1 to 31).
- `month` (Integer): Calendar month of year (1 to 12).
- `is_weekend` (Integer): Binary indicator (1 = Saturday/Sunday, 0 = Weekday).
- `occupancy` (Integer): Number of building occupants present (1 to 12).
- `previous_consumption` (Float): Lagged consumption level from previous hour $t-1$ in kWh (0.92 to 32.73 kWh).
- `appliance_usage` (Integer): Count of active high-draw electrical appliances (0 to 15 units).

### Target Generation Method (Quantile Discretization)
Continuous consumption $y_{\text{kWh}}$ was categorized into 3 equal-frequency quantile tiers:
- **Quantile 1 ($Q_{33.33\%}$)**: $6.22\text{ kWh}$
- **Quantile 2 ($Q_{66.67\%}$)**: $11.00\text{ kWh}$

$$
\text{Target Class} = 
\begin{cases} 
\text{LOW} & \text{if } y_{\text{kWh}} \le 6.22 \\ 
\text{MEDIUM} & \text{if } 6.22 < y_{\text{kWh}} \le 11.00 \\ 
\text{HIGH} & \text{if } y_{\text{kWh}} > 11.00 
\end{cases}
$$

**Class Distribution:**
- **LOW**: 4,013 samples (33.44%)
- **MEDIUM**: 3,992 samples (33.27%)
- **HIGH**: 3,995 samples (33.29%)

---

## Exploratory Data Analysis
Visual figures saved in `reports/figures/`:
1. `target_distribution.png`: Confirms equal 33.3% class balancing.
2. `consumption_distribution.png`: Histogram displaying continuous consumption distribution with quantile boundaries.
3. `hourly_analysis.png`: Shows peak diurnal consumption occurring between 17:00 and 21:00 (evening peak) and off-peak trough between 01:00 and 05:00.
4. `daily_analysis.png`: Illustrates elevated consumption on weekends due to sustained daytime residential occupancy.
5. `monthly_analysis.png`: Highlights seasonal HVAC demand spikes during summer months (July/August cooling) and winter months (December/January heating).
6. `correlation_matrix.png`: Heatmap demonstrating strong positive correlations between target consumption and `previous_consumption` ($r = 0.88$), `appliance_usage` ($r = 0.52$), and `occupancy` ($r = 0.38$).

---

## Data Preprocessing
- **Missing Values & Integrity**: Dataset contains 0 missing entries and 0 duplicate rows.
- **Scaling**: Standard scaling ($\mu = 0, \sigma = 1$) applied to all numerical features.
- **Leakage Prevention**: Standard scalers are encapsulated inside Scikit-Learn `ColumnTransformer` and `Pipeline` objects. Preprocessors are fitted **exclusively on `X_train`** during model training.

---

## Feature Engineering
Temporal and lag features derived:
- `is_weekend`: Extracted from timestamp calendar day of week.
- `previous_consumption`: 1-hour lag feature ($t-1$) modeling thermal inertia and household consumption momentum without introducing target leakage.

---

## Model Development
Train/test split was executed using a **80/20 Stratified Split** with fixed `random_state=42`:
- **Training Set (`X_train`)**: 9,600 samples
- **Test Set (`X_test`)**: 2,400 samples

---

## Algorithms Used

### 1. Logistic Regression
Generalized linear model providing a baseline multi-class decision boundary using L-BFGS optimization.
- `solver`: `'lbfgs'`
- `max_iter`: `1000`
- `C`: `1.0`

### 2. Random Forest Classifier
Ensemble of 150 bagging decision trees capturing non-linear interactions between weather extremes and appliance loads.
- `n_estimators`: `150`
- `max_depth`: `12`
- `min_samples_split`: `4`
- `criterion`: `'gini'`

### 3. Support Vector Machine (SVC)
Kernel machine projecting features into high-dimensional space using Radial Basis Function (RBF) kernel.
- `C`: `2.0`
- `kernel`: `'rbf'`
- `gamma`: `'scale'`
- `probability`: `True`

---

## Evaluation Metrics
Models were benchmarked on the 2,400 test samples using macro-averaged metrics to treat all classes equally:

$$
\text{Macro Precision} = \frac{P_{\text{LOW}} + P_{\text{MEDIUM}} + P_{\text{HIGH}}}{3}
$$

$$
\text{Macro Recall} = \frac{R_{\text{LOW}} + R_{\text{MEDIUM}} + R_{\text{HIGH}}}{3}
$$

$$
\text{Macro F1-Score} = \frac{F1_{\text{LOW}} + F1_{\text{MEDIUM}} + F1_{\text{HIGH}}}{3}
$$

---

## Results

### Empirical Metric Comparison Table
*Actual evaluated metrics from test set (`reports/model_results.csv`):*

| Model Name | Accuracy | Precision (Macro) | Recall (Macro) | F1-Score (Macro) | Latency (ms) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | **0.9325** | **0.9326** | **0.9325** | **0.9325** | **18.5 ms** |
| **Support Vector Machine** | 0.9179 | 0.9178 | 0.9179 | 0.9178 | 32.1 ms |
| **Logistic Regression** | 0.8775 | 0.8778 | 0.8774 | 0.8775 | 3.2 ms |

---

### Actual Multi-Class Confusion Matrices (Test Set = 2,400 samples)

#### 1. Random Forest (Selected Model)
- **LOW Actual**: 754 Correct | 49 Predicted MEDIUM | 0 Predicted HIGH
- **MEDIUM Actual**: 48 Predicted LOW | 719 Correct | 31 Predicted HIGH
- **HIGH Actual**: 0 Predicted LOW | 34 Predicted MEDIUM | 765 Correct

```
[[754,  49,   0],
 [ 48, 719,  31],
 [  0,  34, 765]]
```

#### 2. Support Vector Machine
```
[[743,  60,   0],
 [ 77, 692,  29],
 [  0,  31, 768]]
```

#### 3. Logistic Regression
```
[[718,  85,   0],
 [103, 649,  46],
 [  0,  60, 739]]
```

---

## Model Comparison & Best Model Selection
**Random Forest** achieved the highest performance across all evaluation metrics:
- **Macro F1-Score**: **0.9325** (vs. 0.9178 for SVM and 0.8775 for Logistic Regression)
- **Accuracy**: **93.25%**
- **Misclassification Analysis**: Zero misclassifications occurred between polar extremes (LOW vs. HIGH). Minor errors occurred only at adjacent decision thresholds (LOW $\leftrightarrow$ MEDIUM and MEDIUM $\leftrightarrow$ HIGH).
- **Feature Importance**: Random Forest revealed `previous_consumption` (32.4%), `temperature` (24.1%), `hour` (16.8%), and `appliance_usage` (14.2%) as the top contributing features.

**Random Forest** was selected and serialized to `backend/model/electricity_prediction_model.pkl`.

---

## Application Architecture
```
+-------------------------------------------------------+
|                React / TypeScript UI                  |
|   (Dashboard, Predict Form, Analytics, Model Perf)    |
+---------------------------+---------------------------+
                            | HTTP POST /predict
                            v
+-------------------------------------------------------+
|               Python FastAPI Backend                  |
|    (app.py, schemas.py, prediction_service.py)        |
+---------------------------+---------------------------+
                            | Pipeline.predict()
                            v
+-------------------------------------------------------+
|          Serialized Scikit-Learn Pipeline             |
|   StandardScaler + RandomForestClassifier (joblib)    |
+-------------------------------------------------------+
```

---

## API Implementation
FastAPI implementation in `backend/app.py`:
- `POST /predict`: Pydantic input validation, pipeline transformation, returns prediction class, confidence score, and probability distribution.
- `GET /health`: Health status & model loading check.
- `GET /model-info`: Hyperparameters and benchmark results.
- `GET /models`: Full evaluation comparison.
- `GET /analytics`: Hourly, daily, and monthly load telemetry.

---

## Frontend Implementation
React Vite interface preserving AI Studio visual identity:
- **Validation**: Client-side boundary checking in `predictionService.ts`.
- **Live Integration**: Dynamic HTTP calls via `apiClient.ts` with clean fallback handling.
- **Visual Display**: Metric callouts, confidence progress bars, category donut charts, and interactive confusion matrices.

---

## Testing
Automated pytest suite (`tests/test_api.py`) executed 9 comprehensive test cases:
1. `test_health_endpoint`: Verified 200 OK and model readiness.
2. `test_predict_low_consumption_scenario`: Verified LOW classification for night standby.
3. `test_predict_medium_consumption_scenario`: Verified MEDIUM classification for workday afternoon.
4. `test_predict_high_consumption_scenario`: Verified HIGH classification for summer peak.
5. `test_predict_invalid_input_out_of_range`: Verified 422 HTTP rejection for temperature > 60°C.
6. `test_predict_missing_input_field`: Verified 422 HTTP rejection when required fields are missing.
7. `test_predict_boundary_values`: Verified boundary stability at 0 hour / 0 appliances.
8. `test_models_comparison_endpoint`: Verified GET `/models` returns complete evaluation metrics.
9. `test_analytics_endpoint`: Verified GET `/analytics` returns load telemetry.

**Result**: 9/9 Passed (100% Pass Rate).

---

## Limitations
1. Dataset represents single-building telemetry; multi-facility generalization requires additional domain transfer training.
2. Non-linear solar generation / battery storage back-feed was not included in feature space.

---

## Future Enhancements
1. Export model to ONNX format for sub-5ms edge deployment.
2. Integrate temporal deep learning models (LSTM / Transformer) for continuous multi-step forecasting.
3. Implement live WebSocket / MQTT streaming for smart meter telemetry.

---

## Conclusion
The **VoltAI Electricity Consumption Prediction System** successfully formulates energy usage classification using quantile discretization, trains multiple machine learning classifiers without data leakage, and selects **Random Forest Classifier** (93.25% F1-Score) as the optimal production model. The complete pipeline is serialized and served through a FastAPI backend and React frontend.
