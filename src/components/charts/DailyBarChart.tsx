import React from 'react';
import { DailyDistributionPoint } from '../../types';

interface DailyBarChartProps {
  data: DailyDistributionPoint[];
  title?: string;
}

export const DailyBarChart: React.FC<DailyBarChartProps> = ({
  data,
  title = 'Daily Consumption Profile',
}) => {
  const maxVal = Math.max(...data.map((d) => d.avg_kwh), 8);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">Weekly distribution (Weekday vs Weekend baseline load)</p>
      </div>

      <div className="h-44 w-full flex items-end justify-between gap-2 pt-2 pb-6">
        {data.map((day) => {
          const heightPct = (day.avg_kwh / maxVal) * 100;
          return (
            <div key={day.day_name} className="flex-1 flex flex-col items-center h-full justify-end group">
              <span className="text-[11px] font-mono font-bold text-cyan-700 group-hover:opacity-100 opacity-0 transition-opacity mb-1">
                {day.avg_kwh}k
              </span>

              <div
                className={`w-full max-w-[42px] rounded-t-md transition-all duration-150 shadow-2xs ${
                  day.is_weekend
                    ? 'bg-purple-600 hover:bg-purple-500'
                    : 'bg-cyan-600 hover:bg-cyan-500'
                }`}
                style={{ height: `${heightPct}%` }}
              />

              <div className="mt-2 text-center">
                <span className="block text-xs font-bold text-slate-800 font-mono">
                  {day.day_name}
                </span>
                <span className="block text-[10px] text-slate-500 font-medium">
                  {day.is_weekend ? 'Weekend' : 'Weekday'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

