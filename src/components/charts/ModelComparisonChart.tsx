import React, { useState } from 'react';
import { ModelMetrics } from '../../types';

interface ModelComparisonChartProps {
  models: ModelMetrics[];
}

export const ModelComparisonChart: React.FC<ModelComparisonChartProps> = ({ models }) => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'accuracy' | 'f1_score' | 'precision' | 'recall'>('all');

  const metrics: Array<{ key: keyof Pick<ModelMetrics, 'accuracy' | 'precision' | 'recall' | 'f1_score'>; label: string; color: string }> = [
    { key: 'accuracy', label: 'Accuracy', color: '#06b6d4' },
    { key: 'f1_score', label: 'F1 Score', color: '#10b981' },
    { key: 'precision', label: 'Precision', color: '#a855f7' },
    { key: 'recall', label: 'Recall', color: '#f59e0b' },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Model Metric Comparison</h3>
          <p className="text-xs text-slate-500">Side-by-side benchmark performance across classification algorithms</p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedMetric === 'all'
                ? 'bg-white text-cyan-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setSelectedMetric('f1_score')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedMetric === 'f1_score'
                ? 'bg-white text-cyan-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            F1 Score
          </button>
          <button
            onClick={() => setSelectedMetric('accuracy')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedMetric === 'accuracy'
                ? 'bg-white text-cyan-700 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accuracy
          </button>
        </div>
      </div>

      {/* Model Bars Group */}
      <div className="space-y-6">
        {models.map((model) => {
          return (
            <div key={model.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{model.model_name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">({model.algorithm_family})</span>
                  {model.is_best && (
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 font-mono border border-emerald-200">
                      ★ Top Benchmark
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-slate-500">
                  Latency: <span className="text-slate-800 font-bold">{model.latency_ms}ms</span>
                </span>
              </div>

              {/* Grouped or Single Bar display */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                {metrics
                  .filter((m) => selectedMetric === 'all' || selectedMetric === m.key)
                  .map((m) => {
                    const value = model[m.key] as number;
                    const pct = (value * 100).toFixed(1);

                    return (
                      <div
                        key={m.key}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-500 font-medium">{m.label}</span>
                          <span className="font-bold text-slate-900 tabular-nums">{pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: m.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

