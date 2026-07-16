import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-white/8 text-[#CBD5E1]',
  success: 'bg-green-500/15 text-green-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-red-400',
  info: 'bg-blue-500/15 text-blue-400',
};

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: keyof typeof variants }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', variants[variant])}>
      {children}
    </span>
  );
}
