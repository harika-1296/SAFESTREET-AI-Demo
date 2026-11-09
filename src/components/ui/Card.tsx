import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-3xl shadow-card p-5',
        hover && 'hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, subtitle, action, icon, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 text-lavender-700">{icon}</div>}
        <div>
          <h2 className="text-lg font-bold text-plum">{title}</h2>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type BadgeTone = 'lavender' | 'emergency' | 'warning' | 'success' | 'neutral' | 'nude' | 'dark';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

const badgeTones: Record<BadgeTone, string> = {
  lavender: 'bg-lavender-100 text-lavender-700',
  emergency: 'bg-emergency-light text-emergency-dark',
  warning: 'bg-warning-light text-warning-dark',
  success: 'bg-success-light text-success-dark',
  neutral: 'bg-lavender-100/60 text-plum-muted',
  nude: 'bg-nude-100 text-nude-700',
  dark: 'bg-plum text-white',
};

const dotTones: Record<BadgeTone, string> = {
  lavender: 'bg-lavender-400',
  emergency: 'bg-emergency',
  warning: 'bg-warning',
  success: 'bg-success',
  neutral: 'bg-muted',
  nude: 'bg-nude-400',
  dark: 'bg-white',
};

export function Badge({ children, tone = 'lavender', dot, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', badgeTones[tone], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotTones[tone])} />}
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-3xl bg-lavender-100 flex items-center justify-center text-lavender-500 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-plum">{title}</h3>
      <p className="text-sm text-muted mt-1 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
