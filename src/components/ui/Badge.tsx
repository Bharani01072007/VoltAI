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
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      label: 'Low Consumption',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      label: 'Medium Consumption',
    },
    HIGH: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
      label: 'High Consumption',
    },
  }[level];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono tracking-wide ${styles.bg} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${styles.dot} shrink-0`}
          aria-hidden="true"
        />
      )}
      <span>{level}</span>
    </span>
  );
};
