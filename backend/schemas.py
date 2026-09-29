from pydantic import BaseModel, Field
from typing import Dict, Optional, List, Any

class ElectricityPredictionRequest(BaseModel):
    temperature: float = Field(..., description="Ambient temperature in °C (-30.0 to 60.0)", ge=-30.0, le=60.0)
    humidity: float = Field(..., description="Relative humidity % (0.0 to 100.0)", ge=0.0, le=100.0)
    hour: int = Field(..., description="Hour of day (0 to 23)", ge=0, le=23)
    day: int = Field(..., description="Day of month (1 to 31)", ge=1, le=31)
    month: int = Field(..., description="Month of year (1 to 12)", ge=1, le=12)
    is_weekend: bool = Field(..., description="True if Saturday/Sunday, False otherwise")
    occupancy: int = Field(..., description="Occupancy count (1 to 50)", ge=1, le=50)
    previous_consumption: float = Field(..., description="Previous hour consumption in kWh (0.0 to 100.0)", ge=0.0, le=100.0)
    appliance_usage: int = Field(..., description="Active high-draw appliance count (0 to 30)", ge=0, le=30)

    class Config:
        json_schema_extra = {
            "example": {
                "temperature": 28.5,
                "humidity": 65.0,
                "hour": 18,
                "day": 15,
                "month": 9,
                "is_weekend": False,
                "occupancy": 4,
                "previous_consumption": 3.8,
                "appliance_usage": 5
            }
        }

class ElectricityPredictionResponse(BaseModel):
    prediction: str = Field(..., description="Predicted level: LOW, MEDIUM, or HIGH")
    confidence: float = Field(..., description="Model confidence score between 0.0 and 1.0")
    probabilities: Dict[str, float] = Field(..., description="Class probability breakdown")
    model: str = Field(..., description="Name of the deployed ML model")
    timestamp: str = Field(..., description="ISO 8601 prediction timestamp")
    inference_time_ms: float = Field(..., description="Inference latency in milliseconds")

class HealthCheckResponse(BaseModel):
    status: str
    is_model_loaded: bool
    model_name: str
    version: str

class ModelInfoResponse(BaseModel):
    model_name: str
    feature_columns: List[str]
    target_classes: List[str]
    best_f1_macro: float
    best_accuracy: float
    models_evaluated: List[Dict[str, Any]]
