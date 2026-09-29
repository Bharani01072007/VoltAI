import React, { useState } from 'react';
import { MonthlyDistributionPoint } from '../../types';

interface MonthlyLineChartProps {
  data: MonthlyDistributionPoint[];
  title?: string;
}

export const MonthlyLineChart: React.FC<MonthlyLineChartProps> = ({
  data,
  title = 'Monthly Consumption Seasonality',
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyDistributionPoint | null>(null);

  const width = 600;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = 8.5;
  const minVal = 2.5;

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  const linePath = data.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.avg_kwh)}`,
    ''
  );

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-400">Seasonal variance driven by heating & cooling requirements</p>
        </div>
        {hoveredMonth && (
          <span className="text-xs font-mono text-cyan-300">
            {hoveredMonth.month_name} ({hoveredMonth.season}): {hoveredMonth.avg_kwh.toFixed(1)} kWh
          </span>
        )}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
        {/* Horizontal grid lines */}
        {[3, 5, 7].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + innerWidth}
                y2={y}
                stroke="#1e293b"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                {tick}k
              </text>
            </g>
          );
        })}

        {/* Path */}
        <path
          d={linePath}
          fill="none"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.avg_kwh);
          const isSummer = d.season === 'Summer';
          const isWinter = d.season === 'Winter';

          return (
            <g
              key={d.month_name}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredMonth(d)}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <circle
                cx={x}
                cy={y}
                r={hoveredMonth?.month_name === d.month_name ? 5 : 3.5}
                fill={isSummer ? '#f43f5e' : isWinter ? '#38bdf8' : '#10b981'}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              <text
                x={x}
                y={padding.top + innerHeight + 16}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {d.month_name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
