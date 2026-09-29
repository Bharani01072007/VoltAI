import React from 'react';

interface SliderInputProps {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  description?: string;
  error?: string;
  onChange: (value: number) => void;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  name,
  value,
  min,
  max,
  step = 1,
  unit,
  description,
  error,
  onChange,
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={name} className="font-semibold text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            id={name}
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleNumberChange}
            aria-label={label}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-xs font-mono font-medium text-slate-900 tabular-nums focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-2xs"
          />
          {unit && <span className="text-slate-500 font-mono text-xs">{unit}</span>}
        </div>
      </div>

      <div className="relative pt-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          aria-label={`${label} slider`}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
          style={{
            background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${percentage}%, #e2e8f0 ${percentage}%, #e2e8f0 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1 font-medium">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>

      {description && !error && (
        <p className="text-[11px] text-slate-500">{description}</p>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
};
