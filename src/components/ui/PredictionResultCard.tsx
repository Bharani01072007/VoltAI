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
      badgeColor: 'text-emerald-800 border-emerald-200 bg-emerald-50',
      iconBg: 'bg-emerald-100 text-emerald-700',
    },
    MEDIUM: {
      headline: 'Average Electricity Usage',
      subtext: 'Typical power consumption for standard household activities.',
      tip: 'To keep bills lower, keep your AC thermostat set to 24°C–26°C and switch off idle electronics.',
      badgeColor: 'text-amber-800 border-amber-200 bg-amber-50',
      iconBg: 'bg-amber-100 text-amber-700',
    },
    HIGH: {
      headline: 'Heavy / Peak Electricity Usage',
      subtext: 'High electrical load detected due to multiple appliances, high temperature, or peak hours.',
      tip: 'Consider turning off non-essential appliances or delaying laundry/geysers to avoid high electricity bills.',
      badgeColor: 'text-rose-800 border-rose-200 bg-rose-50',
      iconBg: 'bg-rose-100 text-rose-700',
    },
  }[result.prediction];

  // Format latency in simple terms
  const latencyMs = typeof result.inference_time_ms === 'number' ? result.inference_time_ms : 150;
  const speedText = latencyMs < 300 ? '⚡ Super Fast' : '⏱️ Fast';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header and Class Display */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-700">
            <Sparkles className="h-4 w-4" />
            <span>AI Prediction Result</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {result.prediction}
            </h2>
            <ConsumptionBadge level={result.prediction} size="lg" />
          </div>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {levelInfo.headline}
          </p>
          <p className="text-xs text-slate-500">
            {levelInfo.subtext}
          </p>
        </div>

        {/* Likelihood / Confidence & Speed Box */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 self-start sm:self-auto shadow-2xs min-w-[200px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Chance of Being {result.prediction}</div>
              <div className="text-2xl font-bold font-mono text-cyan-700 tabular-nums">
                {confidencePct}%
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Response Speed</div>
              <div className="text-xs font-bold text-slate-800">
                {speedText} <span className="text-slate-400 font-mono font-normal">({Math.round(latencyMs)}ms)</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 bg-white rounded-lg px-2.5 py-1.5 border border-slate-200 font-medium">
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
          <h4 className="text-xs font-bold text-slate-900">What does this mean for you?</h4>
          <p className="text-xs leading-relaxed font-medium">{levelInfo.tip}</p>
        </div>
      </div>

      {/* Likelihood Breakdown */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">How Likely Is Each Level?</span>
          <span className="text-slate-500 font-medium text-[11px]">AI Probability</span>
        </div>

        {/* Stacked visual bar */}
        <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden flex border border-slate-200 shadow-inner">
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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
            <span className="block text-xs font-bold text-emerald-700">🟢 LOW (Light)</span>
            <span className="text-sm font-bold text-slate-800 tabular-nums font-mono">
              {(result.probabilities.LOW * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
            <span className="block text-xs font-bold text-amber-800">🟡 MEDIUM (Normal)</span>
            <span className="text-sm font-bold text-slate-800 tabular-nums font-mono">
              {(result.probabilities.MEDIUM * 100).toFixed(1)}%
            </span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5">
            <span className="block text-xs font-bold text-rose-700">🔴 HIGH (Heavy)</span>
            <span className="text-sm font-bold text-slate-800 tabular-nums font-mono">
              {(result.probabilities.HIGH * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Input Summary Grid */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-slate-800">
          📋 Summary of What You Entered
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-[11px] font-medium text-slate-500">🌡️ Temperature</span>
            <span className="font-bold text-slate-800">{input.temperature}°C</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-[11px] font-medium text-slate-500">💧 Humidity</span>
            <span className="font-bold text-slate-800">{input.humidity}%</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-[11px] font-medium text-slate-500">🕐 Time</span>
            <span className="font-bold text-slate-800">{input.hour.toString().padStart(2, '0')}:00</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-[11px] font-medium text-slate-500">🏖️ Weekend?</span>
            <span className="font-bold text-slate-800">{input.is_weekend ? 'Yes' : 'No'}</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-[11px] font-medium text-slate-500">👥 People Home</span>
            <span className="font-bold text-slate-800">{input.occupancy} people</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
            <span className="block text-[11px] font-medium text-slate-500">⚡ Last Hour</span>
            <span className="font-bold text-slate-800">{input.previous_consumption} kWh</span>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 col-span-2">
            <span className="block text-[11px] font-medium text-slate-500">🔌 Big Appliances Running</span>
            <span className="font-bold text-slate-800">{input.appliance_usage} appliances</span>
          </div>
        </div>
      </div>

      {/* Footer (Simplified) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <ShieldCheck className="h-4 w-4 text-cyan-600" />
          <span>Calculated by: <strong className="text-slate-900 font-mono">{result.model}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Details'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};


