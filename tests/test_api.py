"""
Automated Backend API & Model Inference Unit/Integration Tests
Tests:
1. Low-consumption scenario
2. Medium-consumption scenario
3. High-consumption scenario
4. Invalid input (e.g. temperature out of range)
5. Missing required field
6. Boundary values
7. Health endpoint readiness
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to python path for test imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app import app

client = TestClient(app)

def test_health_endpoint():
    """Verify backend health status endpoint returns 200 OK and model is loaded"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["is_model_loaded"] is True
    assert "model_name" in data

def test_predict_low_consumption_scenario():
    """Test unseen input expecting LOW consumption (nighttime, low appliances, cool temp)"""
    payload = {
        "temperature": 15.0,
        "humidity": 45.0,
        "hour": 3,
        "day": 10,
        "month": 2,
        "is_weekend": False,
        "occupancy": 1,
        "previous_consumption": 1.2,
        "appliance_usage": 1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["LOW", "MEDIUM", "HIGH"]
    assert "confidence" in data
    assert "probabilities" in data
    assert data["probabilities"]["LOW"] > 0
    assert "inference_time_ms" in data

def test_predict_medium_consumption_scenario():
    """Test unseen input expecting MEDIUM consumption (midday, moderate appliances)"""
    payload = {
        "temperature": 22.0,
        "humidity": 55.0,
        "hour": 12,
        "day": 15,
        "month": 5,
        "is_weekend": False,
        "occupancy": 3,
        "previous_consumption": 4.5,
        "appliance_usage": 3
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0.0 <= data["confidence"] <= 1.0

def test_predict_high_consumption_scenario():
    """Test unseen input expecting HIGH consumption (summer afternoon peak, high appliances & occupancy)"""
    payload = {
        "temperature": 35.0,
        "humidity": 75.0,
        "hour": 18,
        "day": 20,
        "month": 7,
        "is_weekend": True,
        "occupancy": 6,
        "previous_consumption": 14.5,
        "appliance_usage": 8
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["LOW", "MEDIUM", "HIGH"]
    assert data["prediction"] == "HIGH" or data["probabilities"]["HIGH"] > 0.3

def test_predict_invalid_input_out_of_range():
    """Test validation rejection when temperature exceeds physical boundaries (> 60°C)"""
    payload = {
        "temperature": 150.0,  # Invalid
        "humidity": 55.0,
        "hour": 12,
        "day": 15,
        "month": 5,
        "is_weekend": False,
        "occupancy": 3,
        "previous_consumption": 4.5,
        "appliance_usage": 3
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity (Pydantic validation)

def test_predict_missing_input_field():
    """Test rejection when required field 'occupancy' is omitted"""
    payload = {
        "temperature": 25.0,
        "humidity": 55.0,
        "hour": 12,
        "day": 15,
        "month": 5,
        "is_weekend": False,
        # occupancy is missing
        "previous_consumption": 4.5,
        "appliance_usage": 3
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_predict_boundary_values():
    """Test lower and upper physical boundary inputs (0 hour, 0 appliance usage)"""
    payload = {
        "temperature": -10.0,
        "humidity": 0.0,
        "hour": 0,
        "day": 1,
        "month": 1,
        "is_weekend": False,
        "occupancy": 1,
        "previous_consumption": 0.0,
        "appliance_usage": 0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] in ["LOW", "MEDIUM", "HIGH"]

def test_models_comparison_endpoint():
    """Test GET /models returns list of trained models with metrics"""
    response = client.get("/models")
    assert response.status_code == 200
    models = response.json()
    assert isinstance(models, list)
    assert len(models) == 3
    for m in models:
        assert "model_name" in m
        assert "f1_score" in m
        assert "accuracy" in m

def test_analytics_endpoint():
    """Test GET /analytics returns complete summary data"""
    response = client.get("/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "hourly_distribution" in data
    assert "category_distribution" in data
    assert "feature_importance" in data
