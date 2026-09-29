import React, { useState, useEffect } from 'react';
import { ConfusionMatrix } from '../charts/ConfusionMatrix';
import { ModelComparisonChart } from '../charts/ModelComparisonChart';
import { modelService } from '../../services/modelService';
import { ConfusionMatrixData, ModelMetrics } from '../../types';
import {
  Award,
  BrainCircuit,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Layers,
  Loader2,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const ModelPerformanceView: React.FC = () => {
  const [models, setModels] = useState<ModelMetrics[]>([]);
  const [selectedModelForMatrix, setSelectedModelForMatrix] = useState<string>('Random Forest');
  const [matrixData, setMatrixData] = useState<ConfusionMatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const modelList = await modelService.getModelComparisons();
        setModels(modelList);
        const matrix = await modelService.getConfusionMatrix(selectedModelForMatrix);
        setMatrixData(matrix);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSelectModelMatrix = async (modelName: string) => {
    setSelectedModelForMatrix(modelName);
    const matrix = await modelService.getConfusionMatrix(modelName);
    setMatrixData(matrix);
  };

  if (loading || models.length === 0 || !matrixData) {
    return (
      <div className="flex h-96 items-center justify-center space-x-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
        <span className="text-sm font-medium">Loading model evaluation metrics...</span>
      </div>
    );
  }

  const bestModel = models.find((m) => m.is_best) || models[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-mono">
          Model Performance & Evaluation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cross-validation benchmarks, multi-class confusion matrices, and latency comparisons
        </p>
      </div>

      {/* Best Model Indicator Callout */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-100 text-emerald-700 shadow-2xs">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-bold">
                  Top Validation Benchmark Candidate
                </span>
                <span className="text-[10px] rounded px-2 py-0.5 bg-emerald-200/60 text-emerald-900 font-mono font-bold">
                  Test Split Winner
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {bestModel.model_name}{' '}
                <span className="text-sm font-normal text-slate-600 font-sans">
                  ({bestModel.algorithm_family})
                </span>
              </h3>
              <p className="text-xs text-slate-700 mt-1 max-w-2xl font-medium">
                Achieved top macro F1-score of{' '}
                <strong className="text-emerald-700 font-mono">
                  {(bestModel.f1_score * 100).toFixed(1)}%
                </strong>{' '}
                and overall test accuracy of{' '}
                <strong className="text-emerald-700 font-mono">
                  {(bestModel.accuracy * 100).toFixed(1)}%
                </strong>
                . Balances low latency ({bestModel.latency_ms}ms) with resilient non-linear split boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto shrink-0 bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold">Inference Latency</span>
              <span className="text-sm font-bold text-cyan-700">{bestModel.latency_ms} ms</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="block text-[10px] text-slate-500 font-semibold">Train Time</span>
              <span className="text-sm font-bold text-slate-800">{bestModel.training_time_sec} s</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-600 border-t border-emerald-200 pt-2.5">
          <Info className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            Candidate status reflects cross-validation splits. In production, final model selection is verified against real backend ground truth.
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Algorithm Comparison Table</h3>
          <p className="text-xs text-slate-500">
            Performance metrics across test dataset (4,250 held-out samples)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                <th className="py-2.5 px-3 font-semibold">Model</th>
                <th className="py-2.5 px-3 font-semibold">Algorithm Family</th>
                <th className="py-2.5 px-3 font-semibold text-right">Accuracy</th>
                <th className="py-2.5 px-3 font-semibold text-right">Precision</th>
                <th className="py-2.5 px-3 font-semibold text-right">Recall</th>
                <th className="py-2.5 px-3 font-semibold text-right">F1 Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">Latency</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {models.map((model) => (
                <tr
                  key={model.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    model.is_best ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                    {model.model_name}
                    {model.is_best && (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Best
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-sans">{model.algorithm_family}</td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-700 tabular-nums">
                    {(model.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {(model.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {(model.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                    {(model.f1_score * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 tabular-nums">
                    {model.latency_ms}ms
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded font-mono font-semibold ${
                        model.is_best
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {model.is_best ? 'Selected' : 'Evaluated'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Comparison Multi-Metric Bar Chart */}
      <ModelComparisonChart models={models} />

      {/* Confusion Matrix Section with Model Switcher */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Interactive Multi-Class Confusion Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Select an algorithm to evaluate class misclassification margins between LOW, MEDIUM, and HIGH
            </p>
          </div>

          {/* Model Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono self-start sm:self-auto">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectModelMatrix(m.model_name)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedModelForMatrix === m.model_name
                    ? 'bg-white text-cyan-700 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.model_name}
              </button>
            ))}
          </div>
        </div>

        <ConfusionMatrix data={matrixData} modelName={selectedModelForMatrix} />
      </div>
    </div>
  );
};
