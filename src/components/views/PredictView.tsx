import React, { useState } from 'react';
import { SliderInput } from '../ui/SliderInput';
import { PredictionResultCard } from '../ui/PredictionResultCard';
import { PRESET_SCENARIOS } from '../../data/mockData';
import { predictionService, validatePredictionInput } from '../../services/predictionService';
import { apiClient } from '../../services/apiClient';
import { PredictionInput, PredictionResponse } from '../../types';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  RotateCcw,
  Sparkles,
  Thermometer,
  Zap,
} from 'lucide-react';

interface PredictViewProps {
  onPredictionComplete: (result: PredictionResponse, input: PredictionInput) => void;
}

const DEFAULT_INPUT: PredictionInput = {
  temperature: 28.5,
  humidity: 65,
  hour: 18,
  day: 15,
  month: 9,
  is_weekend: false,
  occupancy: 4,
  previous_consumption: 3.8,
  appliance_usage: 5,
};

export const PredictView: React.FC<PredictViewProps> = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState<PredictionInput>(DEFAULT_INPUT);
  const [errors, setErrors] = useState<Partial<Record<keyof PredictionInput, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const handleFieldChange = <K extends keyof PredictionInput>(key: K, value: PredictionInput[K]) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setFormData({ ...preset.input });
    setErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validation = validatePredictionInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    try {
      const pred = await predictionService.predictConsumption(formData);
      setResult(pred);
      onPredictionComplete(pred, formData);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Prediction request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_INPUT);
    setResult(null);
    setErrors({});
    setApiError(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
          Predict Electricity Consumption
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Enter environmental, temporal, and occupancy parameters to evaluate classification outcome
        </p>
      </div>

      {/* Preset Quick Scenario Selector */}
      <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300">Quick Test Scenarios:</span>
          <span className="text-xs text-slate-500">(Click to load benchmark parameter profiles)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-xs group"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                  {preset.name}
                </span>
                <span
                  className={`text-[10px] font-mono px-1 rounded ${
                    preset.expectedClass === 'HIGH'
                      ? 'text-rose-400 bg-rose-950/40'
                      : preset.expectedClass === 'LOW'
                      ? 'text-emerald-400 bg-emerald-950/40'
                      : 'text-amber-400 bg-amber-950/40'
                  }`}
                >
                  {preset.expectedClass}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {preset.tagline}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form and Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form (7 cols on large screen) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/90 bg-slate-900/70 p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Environmental Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold text-cyan-400 font-mono">
                <Thermometer className="h-4 w-4" />
                <span>1. Environmental Variables</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SliderInput
                  label="Temperature"
                  name="temperature"
                  value={formData.temperature}
                  min={-10}
                  max={50}
                  step={0.5}
                  unit="°C"
                  description="Ambient outdoor temperature"
                  error={errors.temperature}
                  onChange={(val) => handleFieldChange('temperature', val)}
                />

                <SliderInput
                  label="Relative Humidity"
                  name="humidity"
                  value={formData.humidity}
                  min={10}
                  max={100}
                  step={1}
                  unit="%"
                  description="Ambient air humidity"
                  error={errors.humidity}
                  onChange={(val) => handleFieldChange('humidity', val)}
                />
              </div>
            </div>

            {/* Section 2: Temporal Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold text-cyan-400 font-mono">
                <Calendar className="h-4 w-4" />
                <span>2. Temporal & Calendar Parameters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Hour */}
                <div className="space-y-1.5">
                  <label htmlFor="hour-select" className="text-xs font-medium text-slate-300">
                    Hour of Day
                  </label>
                  <select
                    id="hour-select"
                    value={formData.hour}
                    onChange={(e) => handleFieldChange('hour', parseInt(e.target.value, 10))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, h) => (
                      <option key={h} value={h}>
                        {h.toString().padStart(2, '0')}:00 {h >= 17 && h <= 21 ? '🔥 (Peak)' : h >= 1 && h <= 5 ? '🌙 (Off-peak)' : ''}
                      </option>
                    ))}
                  </select>
                  {errors.hour && <p className="text-[11px] text-rose-400">{errors.hour}</p>}
                </div>

                {/* Day */}
                <div className="space-y-1.5">
                  <label htmlFor="day-input" className="text-xs font-medium text-slate-300">
                    Day of Month
                  </label>
                  <input
                    id="day-input"
                    type="number"
                    min={1}
                    max={31}
                    value={formData.day}
                    onChange={(e) => handleFieldChange('day', parseInt(e.target.value, 10))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                  {errors.day && <p className="text-[11px] text-rose-400">{errors.day}</p>}
                </div>

                {/* Month */}
                <div className="space-y-1.5">
                  <label htmlFor="month-select" className="text-xs font-medium text-slate-300">
                    Month
                  </label>
                  <select
                    id="month-select"
                    value={formData.month}
                    onChange={(e) => handleFieldChange('month', parseInt(e.target.value, 10))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
                  >
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  {errors.month && <p className="text-[11px] text-rose-400">{errors.month}</p>}
                </div>
              </div>

              {/* Weekend Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Weekend Indicator</span>
                  <span className="text-[11px] text-slate-400">
                    Saturday or Sunday residential schedule shift
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleFieldChange('is_weekend', !formData.is_weekend)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_weekend ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                  aria-pressed={formData.is_weekend}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_weekend ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Section 3: Behavioral & Occupancy Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold text-cyan-400 font-mono">
                <Home className="h-4 w-4" />
                <span>3. Occupancy & Electrical Loads</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SliderInput
                  label="Occupancy"
                  name="occupancy"
                  value={formData.occupancy}
                  min={1}
                  max={15}
                  step={1}
                  unit=" ppl"
                  description="People present"
                  error={errors.occupancy}
                  onChange={(val) => handleFieldChange('occupancy', val)}
                />

                <SliderInput
                  label="Prev Consumption"
                  name="previous_consumption"
                  value={formData.previous_consumption}
                  min={0.1}
                  max={15.0}
                  step={0.1}
                  unit=" kWh"
                  description="Lagged baseline draw"
                  error={errors.previous_consumption}
                  onChange={(val) => handleFieldChange('previous_consumption', val)}
                />

                <SliderInput
                  label="Appliance Units"
                  name="appliance_usage"
                  value={formData.appliance_usage}
                  min={0}
                  max={12}
                  step={1}
                  unit=" units"
                  description="Active heavy appliances"
                  error={errors.appliance_usage}
                  onChange={(val) => handleFieldChange('appliance_usage', val)}
                />
              </div>
            </div>

            {/* API Error Notification */}
            {apiError && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Inference in Progress...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Predict Consumption</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                title="Reset form fields to defaults"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Prediction Output / Result (5 cols on large screen) */}
        <div className="lg:col-span-5">
          {result ? (
            <PredictionResultCard
              result={result}
              input={formData}
              onReset={() => setResult(null)}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60 text-slate-500">
                <Zap className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-200">Awaiting Inference Request</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Adjust input values or select a quick test scenario on the left, then click{' '}
                <strong className="text-cyan-400 font-mono">Predict Consumption</strong> to classify expected consumption level.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Service: <code className="text-slate-400">POST /predict</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
