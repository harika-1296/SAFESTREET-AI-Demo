import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'emergency' | 'outline' | 'warning' | 'dark';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-lavender-400 text-white hover:bg-lavender-700 shadow-soft hover:shadow-glow active:scale-[0.98]',
  secondary: 'bg-lavender-200 text-plum hover:bg-lavender-300 active:scale-[0.98]',
  ghost: 'text-plum-muted hover:bg-lavender-100/60 hover:text-plum active:scale-[0.98]',
  outline: 'border border-lavender-300 text-plum hover:bg-lavender-100/50 active:scale-[0.98]',
  emergency: 'bg-emergency text-white hover:bg-emergency-dark shadow-glow-emergency active:scale-[0.98]',
  warning: 'bg-warning text-white hover:bg-warning-dark active:scale-[0.98]',
  dark: 'bg-plum text-white hover:bg-plum-light active:scale-[0.98]',
};

const sizes: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-xs rounded-xl gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-2xl gap-2',
  lg: 'px-6 py-3.5 text-base rounded-2xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-3xl gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';
