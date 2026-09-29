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
    cyan: 'hover:border-cyan-500/40',
    emerald: 'hover:border-emerald-500/40',
    amber: 'hover:border-amber-500/40',
    blue: 'hover:border-blue-500/40',
    purple: 'hover:border-purple-500/40',
  }[accentColor];

  const iconColor = {
    cyan: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/50',
    emerald: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
    amber: 'text-amber-400 bg-amber-950/60 border-amber-800/50',
    blue: 'text-blue-400 bg-blue-950/60 border-blue-800/50',
    purple: 'text-purple-400 bg-purple-950/60 border-purple-800/50',
  }[accentColor];

  return (
    <div
      className={`relative rounded-xl border border-slate-800/90 bg-slate-900/70 p-5 backdrop-blur-sm transition-all duration-200 ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
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
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-800/60 pt-3 text-xs">
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`shrink-0 font-medium font-mono tabular-nums ${
                trend.isPositive ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {trend.value} {trend.label && <span className="text-slate-500 font-sans">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
