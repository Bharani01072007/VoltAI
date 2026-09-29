import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  badge?: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'blue' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  badge,
  accentColor = 'cyan',
}) => {
  const accentBorder = {
    cyan: 'hover:border-cyan-400',
    emerald: 'hover:border-emerald-400',
    amber: 'hover:border-amber-400',
    blue: 'hover:border-blue-400',
    purple: 'hover:border-purple-400',
  }[accentColor];

  const iconColor = {
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  }[accentColor];

  return (
    <div
      className={`relative rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-200 ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {value}
            </span>
            {badge}
          </div>
        </div>

        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`shrink-0 font-semibold font-mono tabular-nums ${
                trend.isPositive ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {trend.value} {trend.label && <span className="text-slate-400 font-sans">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

