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
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Model Metric Comparison</h3>
          <p className="text-xs text-slate-400">Side-by-side benchmark performance across classification algorithms</p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setSelectedMetric('f1_score')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'f1_score'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            F1 Score
          </button>
          <button
            onClick={() => setSelectedMetric('accuracy')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedMetric === 'accuracy'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
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
                  <span className="font-semibold text-slate-200">{model.model_name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">({model.algorithm_family})</span>
                  {model.is_best && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                      ★ Top Benchmark
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-slate-400">
                  Latency: <span className="text-slate-200 font-bold">{model.latency_ms}ms</span>
                </span>
              </div>

              {/* Grouped or Single Bar display */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                {metrics
                  .filter((m) => selectedMetric === 'all' || selectedMetric === m.key)
                  .map((m) => {
                    const value = model[m.key] as number;
                    const pct = (value * 100).toFixed(1);

                    return (
                      <div
                        key={m.key}
                        className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1"
                      >
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-slate-400">{m.label}</span>
                          <span className="font-bold text-slate-100 tabular-nums">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
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
