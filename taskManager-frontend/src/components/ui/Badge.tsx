import React from 'react';
import { cn } from '../../lib/utils';
import type { TaskStatus } from '../../types';
import { Clock, PlayCircle, CheckCircle2 } from 'lucide-react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TaskStatus;
  showIcon?: boolean;
}

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  TODO: {
    label: 'À faire',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
  },
  IN_PROGRESS: {
    label: 'En cours',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: PlayCircle,
  },
  DONE: {
    label: 'Terminée',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
};

export const Badge: React.FC<BadgeProps> = ({ status, showIcon = true, className, ...props }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.TODO;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {config.label}
    </span>
  );
};
