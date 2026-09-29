import React, { useState } from 'react';
import { ConsumptionBadge } from './Badge';
import { PredictionInput, PredictionResponse } from '../../types';
import { Check, Clock, Copy, Cpu, Download, Sparkles, Thermometer, Users, Zap } from 'lucide-react';

interface PredictionResultCardProps {
  result: PredictionResponse;
  input: PredictionInput;
  onReset?: () => void;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  input,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    const payload = {
      input,
      output: result,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const payload = {
      timestamp: result.timestamp,
      model: result.model,
      input,
      prediction: result.prediction,
      confidence: result.confidence,
      probabilities: result.probabilities,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voltai_prediction_${result.prediction}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const levelColor = {
    LOW: 'from-emerald-500/20 to-emerald-950/20 border-emerald-500/40 text-emerald-400',
    MEDIUM: 'from-amber-500/20 to-amber-950/20 border-amber-500/40 text-amber-400',
    HIGH: 'from-rose-500/20 to-rose-950/20 border-rose-500/40 text-rose-400',
  }[result.prediction];

  const confidencePct = (result.confidence * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-sm shadow-xl space-y-6">
      {/* Header and Class Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Model Inference Output
          </span>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {result.prediction}
            </h2>
            <ConsumptionBadge level={result.prediction} size="lg" />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Estimated electricity consumption classification based on input features
          </p>
        </div>

        {/* Confidence metric box */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3 self-start sm:self-auto">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Confidence</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {confidencePct}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Latency</div>
            <div className="text-sm font-semibold font-mono text-slate-200 tabular-nums">
              {result.inference_time_ms ? `${result.inference_time_ms}ms` : '16ms'}
            </div>
          </div>
        </div>
      </div>

      {/* Probabilities Distribution breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Class Probability Distribution</span>
          <span className="text-slate-400 font-mono text-[11px]">Softmax Posterior</span>
        </div>

        {/* Stacked visual bar */}
        <div className="h-3 w-full rounded-md bg-slate-950 overflow-hidden flex border border-slate-800">
          <div
            style={{ width: `${result.probabilities.LOW * 100}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`LOW: ${(result.probabilities.LOW * 100).toFixed(1)}%`}
          />
          <div
            style={{ width: `${result.probabilities.MEDIUM * 100}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`MEDIUM: ${(result.probabilities.MEDIUM * 100).toFixed(1)}%`}
          />
          <div
            style={{ width: `${result.probabilities.HIGH * 100}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`HIGH: ${(result.probabilities.HIGH * 100).toFixed(1)}%`}
          />
        </div>

        {/* Numeric breakdowns */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
          <div className="rounded-lg border border-emerald-950 bg-emerald-950/20 p-2">
            <span className="block text-[11px] text-emerald-400">LOW</span>
            <span className="text-xs font-bold text-slate-200 tabular-nums">
              {(result.probabilities.LOW * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-lg border border-amber-950 bg-amber-950/20 p-2">
            <span className="block text-[11px] text-amber-400">MEDIUM</span>
            <span className="text-xs font-bold text-slate-200 tabular-nums">
              {(result.probabilities.MEDIUM * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-lg border border-rose-950 bg-rose-950/20 p-2">
            <span className="block text-[11px] text-rose-400">HIGH</span>
            <span className="text-xs font-bold text-slate-200 tabular-nums">
              {(result.probabilities.HIGH * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Input Summary Grid */}
      <div className="space-y-2 border-t border-slate-800/80 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Input Feature Snapshot
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Temperature</span>
            <span className="font-semibold text-slate-200">{input.temperature}°C</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Humidity</span>
            <span className="font-semibold text-slate-200">{input.humidity}%</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Hour of Day</span>
            <span className="font-semibold text-slate-200">{input.hour.toString().padStart(2, '0')}:00</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Calendar Date</span>
            <span className="font-semibold text-slate-200">Day {input.day}, Month {input.month}</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Weekend</span>
            <span className="font-semibold text-slate-200">{input.is_weekend ? 'Yes (Weekend)' : 'No (Weekday)'}</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Occupancy</span>
            <span className="font-semibold text-slate-200">{input.occupancy} persons</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Prev Consumption</span>
            <span className="font-semibold text-slate-200">{input.previous_consumption} kWh</span>
          </div>
          <div className="rounded border border-slate-800/80 bg-slate-950/60 p-2">
            <span className="block text-[10px] text-slate-500">Appliance Count</span>
            <span className="font-semibold text-slate-200">{input.appliance_usage} active</span>
          </div>
        </div>
      </div>

      {/* Metadata footer (Model, Timestamp, Actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-4 text-xs font-mono text-slate-400">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Model: <strong className="text-slate-100">{result.model}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            <span>Timestamp: {result.timestamp || new Date().toISOString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};
