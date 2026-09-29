import React from 'react';
import { ConsumptionLevel } from '../../types';

interface BadgeProps {
  level: ConsumptionLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const ConsumptionBadge: React.FC<BadgeProps> = ({
  level,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const styles = {
    LOW: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-700',
      dot: 'bg-emerald-600',
      label: 'Low Consumption',
    },
    MEDIUM: {
      bg: 'bg-amber-50 border-amber-300 text-amber-800',
      dot: 'bg-amber-500',
      label: 'Medium Consumption',
    },
    HIGH: {
      bg: 'bg-rose-50 border-rose-300 text-rose-700',
      dot: 'bg-rose-600',
      label: 'High Consumption',
    },
  }[level];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tracking-wide ${styles.bg} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`h-2 w-2 rounded-full ${styles.dot} shrink-0`}
          aria-hidden="true"
        />
      )}
      <span>{level}</span>
    </span>
  );
};

