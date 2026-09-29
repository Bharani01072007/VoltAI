import React from 'react';
import { FeatureImportanceItem } from '../../types';

interface FeatureImportanceChartProps {
  data: FeatureImportanceItem[];
  title?: string;
  subtitle?: string;
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  data,
  title = 'Feature Importance Analysis',
  subtitle = 'Normalized Random Forest Gini impurity reduction score per predictor variable',
}) => {
  const maxImportance = Math.max(...data.map((d) => d.importance), 0.3);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Environmental':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';
      case 'Temporal':
        return 'text-purple-400 bg-purple-950/60 border-purple-800/40';
      case 'Behavioral':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <div className="space-y-3.5">
        {data.map((item, index) => {
          const widthPct = (item.importance / maxImportance) * 100;
          return (
            <div key={item.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 text-[11px] w-4">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-slate-200">{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                </div>
                <span className="font-mono font-bold text-cyan-300 tabular-nums">
                  {(item.importance * 100).toFixed(1)}%
                </span>
              </div>

              {/* Bar track */}
              <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 pl-6">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
