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
      <div className="flex h-96 items-center justify-center space-x-2 text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
        <span className="text-sm font-mono">Loading model evaluation matrices...</span>
      </div>
    );
  }

  const bestModel = models.find((m) => m.is_best) || models[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          Model Performance & Evaluation
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Cross-validation benchmarks, multi-class confusion matrices, and latency comparisons
        </p>
      </div>

      {/* Best Model Indicator Callout */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-950/60 text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                  Top Validation Benchmark Candidate
                </span>
                <span className="text-[10px] rounded px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-mono">
                  Test Split Winner
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-mono mt-0.5">
                {bestModel.model_name}{' '}
                <span className="text-sm font-normal text-slate-400 font-sans">
                  ({bestModel.algorithm_family})
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Achieved top macro F1-score of{' '}
                <strong className="text-emerald-400 font-mono">
                  {(bestModel.f1_score * 100).toFixed(1)}%
                </strong>{' '}
                and overall test accuracy of{' '}
                <strong className="text-emerald-400 font-mono">
                  {(bestModel.accuracy * 100).toFixed(1)}%
                </strong>
                . Balances low latency ({bestModel.latency_ms}ms) with resilient non-linear split boundaries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-auto shrink-0 bg-slate-950/60 p-3 rounded-lg border border-emerald-900/50">
            <div>
              <span className="block text-[10px] text-slate-500">Inference Latency</span>
              <span className="text-sm font-bold text-cyan-300">{bestModel.latency_ms} ms</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="block text-[10px] text-slate-500">Train Time</span>
              <span className="text-sm font-bold text-slate-200">{bestModel.training_time_sec} s</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-emerald-900/40 pt-2.5">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>
            Candidate status reflects cross-validation splits. In production, final model selection is verified against real backend ground truth.
          </span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Algorithm Comparison Table</h3>
          <p className="text-xs text-slate-400">
            Performance metrics across test dataset (4,250 held-out samples)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">Model</th>
                <th className="pb-3 font-medium">Algorithm Family</th>
                <th className="pb-3 font-medium text-right">Accuracy</th>
                <th className="pb-3 font-medium text-right">Precision</th>
                <th className="pb-3 font-medium text-right">Recall</th>
                <th className="pb-3 font-medium text-right">F1 Score</th>
                <th className="pb-3 font-medium text-right">Latency</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {models.map((model) => (
                <tr
                  key={model.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    model.is_best ? 'bg-emerald-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 font-bold text-slate-100 flex items-center gap-2">
                    {model.model_name}
                    {model.is_best && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Best
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-slate-400 font-sans">{model.algorithm_family}</td>
                  <td className="py-3.5 text-right font-bold text-cyan-400 tabular-nums">
                    {(model.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-right tabular-nums">
                    {(model.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-right tabular-nums">
                    {(model.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-right font-bold text-emerald-400 tabular-nums">
                    {(model.f1_score * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-right text-slate-400 tabular-nums">
                    {model.latency_ms}ms
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        model.is_best
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
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
            <h3 className="text-sm font-semibold text-slate-200">
              Interactive Multi-Class Confusion Matrix
            </h3>
            <p className="text-xs text-slate-400">
              Select an algorithm to evaluate class misclassification margins between LOW, MEDIUM, and HIGH
            </p>
          </div>

          {/* Model Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-lg text-xs font-mono self-start sm:self-auto">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectModelMatrix(m.model_name)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedModelForMatrix === m.model_name
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
