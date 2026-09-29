import React, { useState } from 'react';
import { ConsumptionBadge } from '../ui/Badge';
import { ConsumptionLevel } from '../../types';

interface CategoryDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  total: number;
  low_pct: number;
  medium_pct: number;
  high_pct: number;
}

interface CategoryDonutChartProps {
  distribution: CategoryDistribution;
  title?: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  distribution,
  title = 'Consumption Category Breakdown',
}) => {
  const [activeSegment, setActiveSegment] = useState<ConsumptionLevel | null>(null);

  const categories: Array<{
    key: ConsumptionLevel;
    label: string;
    count: number;
    pct: number;
    color: string;
    hoverColor: string;
    threshold: string;
  }> = [
    {
      key: 'LOW',
      label: 'Low (<2.5 kWh)',
      count: distribution.LOW,
      pct: distribution.low_pct,
      color: '#10b981', // emerald-500
      hoverColor: '#34d399',
      threshold: '< 2.5 kWh / hour',
    },
    {
      key: 'MEDIUM',
      label: 'Medium (2.5 - 6.0 kWh)',
      count: distribution.MEDIUM,
      pct: distribution.medium_pct,
      color: '#f59e0b', // amber-500
      hoverColor: '#fbbf24',
      threshold: '2.5 – 6.0 kWh / hour',
    },
    {
      key: 'HIGH',
      label: 'High (>6.0 kWh)',
      count: distribution.HIGH,
      pct: distribution.high_pct,
      color: '#f43f5e', // rose-500
      hoverColor: '#fb7185',
      threshold: '> 6.0 kWh / hour',
    },
  ];

  // SVG Donut geometry
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let cumulativeOffset = 0;

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-400">
          Classification bracket distribution across {distribution.total.toLocaleString()} samples
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.pct / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += (cat.pct / 100) * circumference;
              const isHovered = activeSegment === cat.key;

              return (
                <circle
                  key={cat.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={isHovered ? cat.hoverColor : cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setActiveSegment(cat.key)}
                  onMouseLeave={() => setActiveSegment(null)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-xs text-slate-400 font-mono">
              {activeSegment ? activeSegment : 'Total'}
            </span>
            <span className="text-lg font-bold font-mono text-slate-100 tabular-nums">
              {activeSegment
                ? `${categories.find((c) => c.key === activeSegment)?.pct.toFixed(1)}%`
                : distribution.total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend / Metrics List */}
        <div className="flex-1 w-full space-y-3">
          {categories.map((cat) => {
            const isHovered = activeSegment === cat.key;
            return (
              <div
                key={cat.key}
                onMouseEnter={() => setActiveSegment(cat.key)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  isHovered
                    ? 'border-slate-700 bg-slate-800/80'
                    : 'border-slate-800/50 bg-slate-900/40 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <div className="text-xs font-medium text-slate-200">{cat.label}</div>
                    <div className="text-[11px] text-slate-400">{cat.threshold}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-100 tabular-nums">
                    {cat.count.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    {cat.pct.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
