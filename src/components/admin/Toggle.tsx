import { cn } from '@/lib/utils';

export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={cn('w-10 h-6 rounded-full relative transition-colors cursor-pointer', on ? 'bg-blue-500' : 'bg-white/20')}
      style={on ? { background: 'var(--site-primary)' } : undefined}
    >
      <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all', on ? 'right-0.5' : 'left-0.5')} />
    </div>
  );
}
