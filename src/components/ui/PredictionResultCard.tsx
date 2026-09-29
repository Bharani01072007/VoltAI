import React, { useState } from 'react';
import { ConsumptionBadge } from './Badge';
import { PredictionInput, PredictionResponse } from '../../types';
import { Check, Clock, Copy, Download, Lightbulb, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface PredictionResultCardProps {
  result: PredictionResponse;
  input: PredictionInput;
  onReset?: () => void;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  input,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    const payload = { input, output: result };
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

  const confidencePct = (result.confidence * 100).toFixed(1);

  // Friendly human explanation based on prediction
  const levelInfo = {
    LOW: {
      headline: 'Light Electricity Usage',
      subtext: 'Your home is running efficiently with low power consumption.',
      tip: 'Great job! You are in the eco-friendly zone with minimal energy costs.',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    MEDIUM: {
      headline: 'Average Electricity Usage',
      subtext: 'Typical power consumption for standard household activities.',
      tip: 'To keep bills lower, keep your AC thermostat set to 24°C–26°C and switch off idle electronics.',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-950/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    HIGH: {
      headline: 'Heavy / Peak Electricity Usage',
      subtext: 'High electrical load detected due to multiple appliances, high temperature, or peak hours.',
      tip: 'Consider turning off non-essential appliances or delaying laundry/geysers to avoid high electricity bills.',
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-950/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
  }[result.prediction];

  // Format latency in simple terms
  const latencyMs = typeof result.inference_time_ms === 'number' ? result.inference_time_ms : 150;
  const speedText = latencyMs < 300 ? '⚡ Super Fast' : '⏱️ Fast';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm shadow-xl space-y-6">
      {/* Header and Class Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
            <Sparkles className="h-4 w-4" />
            <span>AI Prediction Result</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              {result.prediction}
            </h2>
            <ConsumptionBadge level={result.prediction} size="lg" />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-200">
            {levelInfo.headline}
          </p>
          <p className="text-xs text-slate-400">
            {levelInfo.subtext}
          </p>
        </div>

        {/* Likelihood / Confidence & Speed Box */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 self-start sm:self-auto shadow-inner min-w-[200px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Chance of Being {result.prediction}</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {confidencePct}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-[11px] font-medium text-slate-400">Response Speed</div>
              <div className="text-xs font-semibold text-slate-200">
                {speedText} <span className="text-slate-500 font-mono">({Math.round(latencyMs)}ms)</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900/60 rounded px-2 py-1 border border-slate-800/60">
            📊 <strong>{confidencePct}% of past homes</strong> with these exact conditions had <strong>{result.prediction}</strong> usage.
          </div>
        </div>
      </div>

      {/* Actionable Advice / Tip Box */}
      <div className={`rounded-xl border p-4 flex items-start gap-3 ${levelInfo.badgeColor}`}>
        <div className={`p-2 rounded-lg shrink-0 ${levelInfo.iconBg}`}>
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">What does this mean for you?</h4>
          <p className="text-xs text-slate-300 leading-relaxed">{levelInfo.tip}</p>
        </div>
      </div>

      {/* Likelihood Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200">How Likely Is Each Level?</span>
          <span className="text-slate-400 text-[11px]">AI Probability</span>
        </div>

        {/* Stacked visual bar */}
        <div className="h-3.5 w-full rounded-full bg-slate-950 overflow-hidden flex border border-slate-800 shadow-inner">
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

        {/* Easy cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="rounded-xl border border-emerald-950/80 bg-emerald-950/20 p-2.5">
            <span className="block text-xs font-semibold text-emerald-400">🟢 LOW (Light)</span>
            <span className="text-sm font-bold text-slate-100 tabular-nums">
              {(result.probabilities.LOW * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-xl border border-amber-950/80 bg-amber-950/20 p-2.5">
            <span className="block text-xs font-semibold text-amber-400">🟡 MEDIUM (Normal)</span>
            <span className="text-sm font-bold text-slate-100 tabular-nums">
              {(result.probabilities.MEDIUM * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-xl border border-rose-950/80 bg-rose-950/20 p-2.5">
            <span className="block text-xs font-semibold text-rose-400">🔴 HIGH (Heavy)</span>
            <span className="text-sm font-bold text-slate-100 tabular-nums">
              {(result.probabilities.HIGH * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Input Summary Grid */}
      <div className="space-y-2 border-t border-slate-800 pt-4">
        <h4 className="text-xs font-semibold text-slate-300">
          📋 Summary of What You Entered
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="block text-[11px] text-slate-400">🌡️ Temperature</span>
            <span className="font-semibold text-slate-200">{input.temperature}°C</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="block text-[11px] text-slate-400">💧 Humidity</span>
            <span className="font-semibold text-slate-200">{input.humidity}%</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="block text-[11px] text-slate-400">🕐 Time</span>
            <span className="font-semibold text-slate-200">{input.hour.toString().padStart(2, '0')}:00</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="block text-[11px] text-slate-400">🏖️ Weekend?</span>
            <span className="font-semibold text-slate-200">{input.is_weekend ? 'Yes' : 'No'}</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="block text-[11px] text-slate-400">👥 People Home</span>
            <span className="font-semibold text-slate-200">{input.occupancy} people</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
            <span className="block text-[11px] text-slate-400">⚡ Last Hour</span>
            <span className="font-semibold text-slate-200">{input.previous_consumption} kWh</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 col-span-2">
            <span className="block text-[11px] text-slate-400">🔌 Big Appliances Running</span>
            <span className="font-semibold text-slate-200">{input.appliance_usage} appliances</span>
          </div>
        </div>
      </div>

      {/* Footer (Simplified) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Calculated by: <strong className="text-slate-100">{result.model}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Details'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

