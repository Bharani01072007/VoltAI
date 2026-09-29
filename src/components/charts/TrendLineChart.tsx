import React, { useState } from 'react';
import { TrendDataPoint } from '../../types';

interface TrendLineChartProps {
  data: TrendDataPoint[];
  title?: string;
  subtitle?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title = 'Electricity Consumption Trend (24h Diurnal)',
  subtitle = 'Actual vs Model-Predicted load profile in kilowatt-hours (kWh)',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-500">
        No trend telemetry available
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 50 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => Math.max(d.actual_kwh, d.predicted_kwh)), 9);
  const minVal = 0;

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / (maxVal - minVal)) * innerHeight;

  // Build SVG path strings
  const actualPath = data.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.actual_kwh)}`,
    ''
  );

  const predictedPath = data.reduce(
    (acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.predicted_kwh)}`,
    ''
  );

  const areaPath = `${actualPath} L ${getX(data.length - 1)} ${padding.top + innerHeight} L ${getX(0)} ${
    padding.top + innerHeight
  } Z`;

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Actual (kWh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-3 border-t-2 border-dashed border-purple-400" />
            <span className="text-slate-300">Model Predicted</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (Y axis) */}
          {[0, 2, 4, 6, 8, 10].map((tick) => {
            if (tick > maxVal) return null;
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {tick}k
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#actualGradient)" />

          {/* Actual trend line */}
          <path
            d={actualPath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Predicted line (dashed) */}
          <path
            d={predictedPath}
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* X axis ticks & labels */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <g key={d.timestamp}>
                <line
                  x1={x}
                  y1={padding.top + innerHeight}
                  x2={x}
                  y2={padding.top + innerHeight + 5}
                  stroke="#475569"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 18}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {d.time_label}
                </text>
              </g>
            );
          })}

          {/* Interactive touch/hover points */}
          {data.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={`point-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Invisible large hit area */}
                <rect
                  x={x - innerWidth / (data.length * 2)}
                  y={padding.top}
                  width={innerWidth / data.length}
                  height={innerHeight}
                  fill="transparent"
                />

                {/* Vertical hover indicator line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + innerHeight}
                    stroke="#94a3b8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Dot for Actual */}
                <circle
                  cx={x}
                  cy={getY(d.actual_kwh)}
                  r={isHovered ? 5.5 : 3.5}
                  fill={isHovered ? '#ffffff' : '#06b6d4'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Dot for Predicted */}
                <circle
                  cx={x}
                  cy={getY(d.predicted_kwh)}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#c084fc"
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Card */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute top-2 rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 shadow-xl backdrop-blur-md text-xs font-mono"
            style={{
              left: `${Math.min(
                Math.max(10, (hoveredIndex / (data.length - 1)) * 100 - 15),
                70
              )}%`,
            }}
          >
            <div className="flex items-center justify-between gap-3 text-slate-400 border-b border-slate-800 pb-1 mb-1">
              <span>Time: {hoveredPoint.time_label}</span>
              <span className="font-semibold text-slate-200">
                {hoveredPoint.level}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-cyan-400">
                Actual: {hoveredPoint.actual_kwh.toFixed(1)} kWh
              </span>
              <span className="text-purple-400">
                Pred: {hoveredPoint.predicted_kwh.toFixed(1)} kWh
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Residual: {(hoveredPoint.actual_kwh - hoveredPoint.predicted_kwh).toFixed(2)} kWh
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
