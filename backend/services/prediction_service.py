import os
import time
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List

from schemas import ElectricityPredictionRequest, ElectricityPredictionResponse

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model", "electricity_prediction_model.pkl")
METADATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model", "metadata.json")

class ModelPredictionService:
    def __init__(self):
        self.model_pipeline = None
        self.metadata = {}
        self.is_loaded = False
        self.load_model()

    def load_model(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model_pipeline = joblib.load(MODEL_PATH)
                self.is_loaded = True
                print(f"[ModelPredictionService] ML Model loaded successfully from {MODEL_PATH}")
            else:
                print(f"[ModelPredictionService] Warning: Model file not found at {MODEL_PATH}")

            if os.path.exists(METADATA_PATH):
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)
                print(f"[ModelPredictionService] Metadata loaded successfully from {METADATA_PATH}")
        except Exception as e:
            print(f"[ModelPredictionService] Error loading model artifacts: {e}")
            self.is_loaded = False

    def predict(self, req: ElectricityPredictionRequest) -> ElectricityPredictionResponse:
        if not self.is_loaded or self.model_pipeline is None:
            raise RuntimeError("ML prediction model is not loaded.")

        start_time = time.perf_counter()

        # Convert Pydantic request object to pandas DataFrame with exact feature columns
        input_data = pd.DataFrame([{
            "temperature": req.temperature,
            "humidity": req.humidity,
            "hour": req.hour,
            "day": req.day,
            "month": req.month,
            "is_weekend": 1 if req.is_weekend else 0,
            "occupancy": req.occupancy,
            "previous_consumption": req.previous_consumption,
            "appliance_usage": req.appliance_usage
        }])

        # Perform prediction using serialized scikit-learn Pipeline
        prediction_class = str(self.model_pipeline.predict(input_data)[0])

        probabilities: Dict[str, float] = {}
        confidence = 0.90

        if hasattr(self.model_pipeline, "predict_proba"):
            probs = self.model_pipeline.predict_proba(input_data)[0]
            classes = list(self.model_pipeline.classes_)
            
            for cls, prob in zip(classes, probs):
                probabilities[str(cls)] = float(np.round(prob, 4))
                
            confidence = float(np.round(max(probs), 4))
        else:
            # Fallback uniform if predict_proba is unavailable
            probabilities = {"LOW": 0.33, "MEDIUM": 0.33, "HIGH": 0.34}
            probabilities[prediction_class] = 0.85

        # Ensure all three classes (LOW, MEDIUM, HIGH) exist in response dict
        for label in ["LOW", "MEDIUM", "HIGH"]:
            if label not in probabilities:
                probabilities[label] = 0.0

        latency_ms = float(np.round((time.perf_counter() - start_time) * 1000, 2))
        model_name = self.metadata.get("best_model_name", "Random Forest Classifier")

        return ElectricityPredictionResponse(
            prediction=prediction_class,
            confidence=confidence,
            probabilities=probabilities,
            model=model_name,
            timestamp=datetime.utcnow().isoformat() + "Z",
            inference_time_ms=latency_ms
        )

    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata

model_service_instance = ModelPredictionService()
