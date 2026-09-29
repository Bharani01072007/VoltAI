import React, { useState } from 'react';
import { HourlyDistributionPoint } from '../../types';

interface HourlyBarChartProps {
  data: HourlyDistributionPoint[];
  title?: string;
  subtitle?: string;
}

export const HourlyBarChart: React.FC<HourlyBarChartProps> = ({
  data,
  title = 'Hourly Consumption Profile (24 Hours)',
  subtitle = 'Diurnal average load pattern identifying peak demand windows',
}) => {
  const [hoveredHour, setHoveredHour] = useState<HourlyDistributionPoint | null>(null);

  const maxVal = Math.max(...data.map((d) => d.avg_kwh), 10);

  const getColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'bg-emerald-500/80 hover:bg-emerald-400';
      case 'MEDIUM':
        return 'bg-amber-500/80 hover:bg-amber-400';
      case 'HIGH':
        return 'bg-rose-500/80 hover:bg-rose-400';
      default:
        return 'bg-cyan-500/80';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        {hoveredHour && (
          <div className="text-xs font-mono text-cyan-300">
            {hoveredHour.label}: {hoveredHour.avg_kwh.toFixed(1)} kWh ({hoveredHour.level})
          </div>
        )}
      </div>

      <div className="relative h-48 w-full pt-4 pb-6 flex items-end justify-between gap-1 sm:gap-1.5">
        {data.map((item) => {
          const heightPct = Math.max(8, (item.avg_kwh / maxVal) * 100);
          const isPeak = item.avg_kwh >= 7.0;

          return (
            <div
              key={item.hour}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredHour(item)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              {/* Peak indicator dot */}
              {isPeak && (
                <span className="h-1 w-1 rounded-full bg-rose-400 mb-1 opacity-80" />
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-sm transition-all duration-200 ${getColor(item.level)}`}
                style={{ height: `${heightPct}%` }}
              />

              {/* Hour label (every 2-3 hours on mobile, all on wide screens) */}
              <span
                className={`mt-2 text-[10px] font-mono text-slate-500 group-hover:text-slate-200 ${
                  item.hour % 3 === 0 ? 'opacity-100' : 'opacity-40 sm:opacity-75'
                }`}
              >
                {item.hour.toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Axis summary */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs text-slate-400">
        <span>Night Trough (01:00 - 05:00)</span>
        <span className="text-rose-400 font-medium">Evening Peak (17:00 - 21:00)</span>
      </div>
    </div>
  );
};
