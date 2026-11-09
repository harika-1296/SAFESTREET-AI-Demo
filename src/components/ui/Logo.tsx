import { Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'light';
  className?: string;
}

const sizes = {
  sm: { icon: 18, box: 'w-8 h-8 rounded-xl', text: 'text-sm' },
  md: { icon: 22, box: 'w-10 h-10 rounded-2xl', text: 'text-base' },
  lg: { icon: 28, box: 'w-12 h-12 rounded-2xl', text: 'text-lg' },
  xl: { icon: 36, box: 'w-16 h-16 rounded-3xl', text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, variant = 'default', className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn(s.box, 'flex items-center justify-center bg-lavender-gradient shadow-soft')}>
        <Shield size={s.icon} className="text-white" strokeWidth={2.5} fill="white" fillOpacity={0.2} />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={cn(s.text, 'font-extrabold tracking-tight', variant === 'light' ? 'text-white' : 'text-plum')}>
            SafeStreet<span className="text-lavender-500"> AI</span>
          </div>
          {size === 'xl' && (
            <div className={cn('text-xs font-medium', variant === 'light' ? 'text-white/70' : 'text-muted')}>
              Safety. Intelligence. Togetherness.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
