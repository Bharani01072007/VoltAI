import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { Check, Copy, ExternalLink, Globe, Play, Server, ShieldAlert, Wifi, X } from 'lucide-react';

interface BackendConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: () => void;
}

export const BackendConfigModal: React.FC<BackendConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChange,
}) => {
  const [url, setUrl] = useState(apiClient.getBaseUrl());
  const [preferLive, setPreferLive] = useState(apiClient.getPreferLive());
  const [pingStatus, setPingStatus] = useState<{
    tested: boolean;
    isOnline: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(apiClient.getBaseUrl());
      setPreferLive(apiClient.getPreferLive());
      setPingStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsPinging(true);
    apiClient.setBaseUrl(url);
    const result = await apiClient.checkHealth();
    setPingStatus({
      tested: true,
      ...result,
    });
    setIsPinging(false);
  };

  const handleSave = () => {
    apiClient.setBaseUrl(url);
    apiClient.setPreferLive(preferLive);
    onConfigChange();
    onClose();
  };

  const pythonFastApiSnippet = `# Python ML Backend (FastAPI Implementation)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="Electricity Consumption Predictor")

# Allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    temperature: float
    humidity: float
    hour: int
    day: int
    month: int
    is_weekend: bool
    occupancy: int
    previous_consumption: float
    appliance_usage: int

# Load your trained model (e.g. trained with scikit-learn)
# model = joblib.load("best_random_forest.pkl")

@app.get("/health")
def health():
    return {"status": "ok", "service": "VoltAI ML Backend"}

@app.post("/predict")
def predict_consumption(req: PredictionRequest):
    # Prepare feature vector matching training schema:
    # features = np.array([[req.temperature, req.humidity, req.hour, ...]])
    # probs = model.predict_proba(features)[0] # [P(LOW), P(MED), P(HIGH)]
    
    return {
        "prediction": "HIGH",
        "confidence": 0.914,
        "probabilities": {
            "LOW": 0.021,
            "MEDIUM": 0.065,
            "HIGH": 0.914
        },
        "model": "Random Forest (Production v1.0)",
        "inference_time_ms": 18
    }
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Python Backend Integration Settings</h2>
              <p className="text-xs text-slate-400">
                Configure connection to your external FastAPI, Flask, or Django machine learning service
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Base URL input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200">
              Backend API Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
              />
              <button
                onClick={handleTestConnection}
                disabled={isPinging}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Wifi className={`h-3.5 w-3.5 ${isPinging ? 'animate-pulse text-cyan-400' : ''}`} />
                <span>{isPinging ? 'Pinging...' : 'Ping Test'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Default local dev URL is <code className="font-mono text-cyan-300">http://localhost:8000</code> or your remote URL.
            </p>
          </div>

          {/* Ping status feedback */}
          {pingStatus?.tested && (
            <div
              className={`p-3 rounded-lg border text-xs font-mono ${
                pingStatus.isOnline
                  ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border-amber-500/40 bg-amber-950/30 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{pingStatus.isOnline ? 'Online & Ready' : 'Server Unreachable'}</span>
                <span>Latency: {pingStatus.latencyMs}ms</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{pingStatus.message}</div>
            </div>
          )}

          {/* Mode Switch: Live vs Fallback */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Target Real Backend for Live Predictions
                </div>
                <div className="text-[11px] text-slate-400">
                  When disabled or if backend is offline, the app seamlessly uses the calibrated offline ML simulation engine.
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferLive}
                onChange={(e) => setPreferLive(e.target.checked)}
                className="h-4 w-4 rounded accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Fast Python template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">FastAPI ML Backend Template</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pythonFastApiSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300"
              >
                {copiedCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Python'}</span>
              </button>
            </div>
            <pre className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-slate-300">
              {pythonFastApiSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-6 py-3 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Status: {preferLive ? 'Live API preferred' : 'Offline simulation active'}</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
