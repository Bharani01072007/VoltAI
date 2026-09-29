import React, { useState } from 'react';
import { ML_PIPELINE_STAGES } from '../../data/mockData';
import {
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Gauge,
  Layers,
  LineChart,
  Network,
  Share2,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

export const AboutProjectView: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState(ML_PIPELINE_STAGES[0]);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedPython, setCopiedPython] = useState(false);

  const curlExample = `curl -X POST "http://localhost:8000/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "temperature": 28.5,
    "humidity": 65,
    "hour": 18,
    "day": 15,
    "month": 9,
    "is_weekend": false,
    "occupancy": 4,
    "previous_consumption": 3.8,
    "appliance_usage": 5
  }'`;

  const pythonExample = `import requests

url = "http://localhost:8000/predict"
payload = {
    "temperature": 28.5,
    "humidity": 65,
    "hour": 18,
    "day": 15,
    "month": 9,
    "is_weekend": False,
    "occupancy": 4,
    "previous_consumption": 3.8,
    "appliance_usage": 5
}

response = requests.post(url, json=payload)
data = response.json()

print(f"Predicted Level: {data['prediction']}")
print(f"Confidence: {data['confidence'] * 100:.1f}%")
print(f"Probabilities: {data['probabilities']}")`;

  const copyToClipboard = (text: string, type: 'curl' | 'python') => {
    navigator.clipboard.writeText(text);
    if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedPython(true);
      setTimeout(() => setCopiedPython(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
          About Project
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Theoretical architecture, machine learning pipeline, algorithms, and REST API integration
        </p>
      </div>

      {/* Problem & Solution Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-700 font-mono text-xs uppercase tracking-wider font-bold">
            <Flame className="h-4 w-4 text-rose-600" />
            <span>Problem Formulation</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Dynamic Electricity Demand Fluctuation</h2>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Electricity consumption can vary significantly depending on environmental conditions (ambient temperature, humidity), time of day, calendar factors (weekdays vs weekends), occupancy density, and appliance usage patterns.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Without automated classification, grid operators and facility managers struggle to forecast localized peak demand surges, resulting in costly peaker plant activations, grid instability, and high electricity bills.
          </p>
        </div>

        {/* Solution Card */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-6 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider font-bold">
            <Zap className="h-4 w-4 text-cyan-600" />
            <span>AI Solution</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Machine Learning Multi-Class Classification</h2>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            An AI-based machine-learning system classifies expected electricity consumption into three discrete operational tiers: <strong className="text-emerald-700 font-mono">LOW</strong>, <strong className="text-amber-800 font-mono">MEDIUM</strong>, and <strong className="text-rose-700 font-mono">HIGH</strong> categories.
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            By modeling non-linear interactions across meteorological, temporal, and load features, the model yields actionable forecasts with calibrated posterior probability distributions.
          </p>
        </div>
      </div>

      {/* Machine Learning Pipeline Diagram */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider font-bold">
            <Layers className="h-4 w-4" />
            <span>End-to-End Workflow</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Machine Learning Pipeline</h2>
          <p className="text-xs text-slate-500">
            Click on any pipeline stage below to view its specific engineering procedures, algorithms, and libraries
          </p>
        </div>

        {/* Flow diagram items */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-[760px]">
            {ML_PIPELINE_STAGES.map((stage, idx) => {
              const isSelected = selectedStage.id === stage.id;
              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => setSelectedStage(stage)}
                    className={`flex-1 flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-50 shadow-sm ring-1 ring-cyan-500/50'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      Step 0{stage.step_number}
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-1 whitespace-nowrap">
                      {stage.name}
                    </span>
                  </button>

                  {idx < ML_PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-mono font-semibold text-cyan-700">Stage {selectedStage.step_number} Details</span>
              <h3 className="text-base font-bold text-slate-900">{selectedStage.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedStage.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-md bg-white px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-700 font-medium">{selectedStage.description}</p>

          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-600">Key Implementation Points:</span>
            <ul className="space-y-1">
              {selectedStage.key_details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Algorithms Detailed Breakdown */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Algorithms Evaluated</h2>
          <p className="text-xs text-slate-500">
            Three distinct machine learning paradigms evaluated on the same cross-validation folds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Algorithm 1: Logistic Regression */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">Linear Model</span>
              <span className="text-xs font-mono text-cyan-700 font-semibold">Fast Baseline</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Logistic Regression</h3>
            <p className="text-xs text-slate-600 font-medium">
              Multinomial logistic regression utilizing softmax loss and L2 Ridge regularization. Serves as our primary linear baseline.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2 font-mono">
              <div>• Fast inference (&lt;4ms)</div>
              <div>• Convex loss optimization</div>
              <div>• Limited on non-linear weather interactions</div>
            </div>
          </div>

          {/* Algorithm 2: Random Forest */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-800">Ensemble Trees</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                Top Benchmark
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Random Forest</h3>
            <p className="text-xs text-slate-700 font-medium">
              Ensemble of 150 bootstrapped decision trees with random feature subspacing. Capable of capturing intricate non-linear relationships.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700 border-t border-emerald-200 pt-2 font-mono font-medium">
              <div className="text-emerald-800 font-bold">• Highest macro F1 (93.8%)</div>
              <div>• Resilient against feature collinearity</div>
              <div>• Interpretable Gini importance scoring</div>
            </div>
          </div>

          {/* Algorithm 3: Support Vector Machine */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500">Kernel Machine</span>
              <span className="text-xs font-mono text-purple-700 font-semibold">RBF Kernel</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Support Vector Machine</h3>
            <p className="text-xs text-slate-600 font-medium">
              Projects features into infinite-dimensional Hilbert space via Radial Basis Function (RBF) kernel to maximize classification margins.
            </p>
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2 font-mono">
              <div>• Robust margin boundaries</div>
              <div>• High accuracy (90.8%)</div>
              <div>• Slower inference latency (~34ms)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation Metrics Deep Dive */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Evaluation Metrics</h2>
          <p className="text-xs text-slate-500">
            Standard metrics employed to quantify multi-class classification efficacy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-cyan-700">Accuracy</div>
            <p className="text-slate-600 font-sans text-[11px]">
              Ratio of correctly predicted consumption tiers over total evaluated samples: (TP + TN) / Total.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-emerald-700">Precision</div>
            <p className="text-slate-600 font-sans text-[11px]">
              Fraction of true high-load classifications among all instances classified as high load: TP / (TP + FP).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-amber-800">Recall</div>
            <p className="text-slate-600 font-sans text-[11px]">
              Ability to catch all actual peak surge events: TP / (TP + FN). Minimizes false negatives.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-purple-700">F1 Score</div>
            <p className="text-slate-600 font-sans text-[11px]">
              Harmonic mean of precision and recall. Primary ranking benchmark to mitigate class imbalance.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <div className="font-bold text-rose-700">Confusion Matrix</div>
            <p className="text-slate-600 font-sans text-[11px]">
              3x3 contingency table detailing exact misclassification counts across Low, Medium, and High brackets.
            </p>
          </div>
        </div>
      </div>

      {/* REST API Integration Specification */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-cyan-700 font-mono text-xs uppercase tracking-wider font-bold">
              <Code2 className="h-4 w-4" />
              <span>Backend Contract</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">REST API Service Specification</h2>
            <p className="text-xs text-slate-500">
              The frontend connects to any Python backend (FastAPI, Flask, Django) exposing the <code className="text-cyan-700 font-mono font-semibold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">POST /predict</code> endpoint.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              POST /predict
            </span>
          </div>
        </div>

        {/* Code Blocks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* cURL Request */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 font-mono">cURL Request</span>
              <button
                onClick={() => copyToClipboard(curlExample, 'curl')}
                className="flex items-center gap-1 font-mono text-[11px] text-cyan-700 hover:text-cyan-800 cursor-pointer font-semibold"
              >
                {copiedCurl ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-[11px] font-mono text-slate-100 overflow-x-auto shadow-inner">
              {curlExample}
            </pre>
          </div>

          {/* Python Requests Example */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 font-mono">Python Client Example</span>
              <button
                onClick={() => copyToClipboard(pythonExample, 'python')}
                className="flex items-center gap-1 font-mono text-[11px] text-cyan-700 hover:text-cyan-800 cursor-pointer font-semibold"
              >
                {copiedPython ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedPython ? 'Copied' : 'Copy Python'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-[11px] font-mono text-slate-100 overflow-x-auto shadow-inner">
              {pythonExample}
            </pre>
          </div>
        </div>

        {/* Expected JSON Response Contract */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-700 font-mono">
            Expected JSON Response Format:
          </span>
          <pre className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-[11px] font-mono text-cyan-300 overflow-x-auto shadow-inner">
{`{
  "prediction": "HIGH",
  "confidence": 0.914,
  "probabilities": {
    "LOW": 0.021,
    "MEDIUM": 0.065,
    "HIGH": 0.914
  },
  "model": "Random Forest",
  "inference_time_ms": 18
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
