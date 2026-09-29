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
        return 'text-emerald-800 bg-emerald-50 border-emerald-200';
      case 'Temporal':
        return 'text-purple-800 bg-purple-50 border-purple-200';
      case 'Behavioral':
        return 'text-cyan-800 bg-cyan-50 border-cyan-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="space-y-3.5">
        {data.map((item, index) => {
          const widthPct = (item.importance / maxImportance) * 100;
          return (
            <div key={item.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 font-bold text-[11px] w-4">
                    #{index + 1}
                  </span>
                  <span className="font-bold text-slate-800">{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold border font-mono ${getCategoryColor(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                </div>
                <span className="font-mono font-bold text-cyan-700 tabular-nums">
                  {(item.importance * 100).toFixed(1)}%
                </span>
              </div>

              {/* Bar track */}
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 transition-all duration-500"
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

