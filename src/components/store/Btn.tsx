import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
};

export function Btn({ children, variant = 'primary', size = 'md', className, disabled, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl cursor-pointer select-none';
  return (
    <button
      className={cn(
        base,
        sizes[size],
        variant === 'primary' && 'text-white shadow-lg active:scale-95 hover:opacity-90',
        variant === 'secondary' && 'bg-white/8 hover:bg-white/12 text-foreground border border-white/10 active:scale-95',
        variant === 'ghost' && 'hover:bg-white/6 text-muted-foreground hover:text-foreground active:scale-95',
        variant === 'danger' && 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 active:scale-95',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      style={variant === 'primary' ? { background: 'var(--site-primary)', boxShadow: '0 4px 14px var(--site-glow)' } : undefined}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
