import { useState, useEffect } from 'react';
import { MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSiteVisual } from '@/hooks/useSiteVisual';

export function Preloader() {
  const [done, setDone] = useState(false);
  const { visual } = useSiteVisual();

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0F172A] transition-all duration-700',
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
    >
      {visual.heroImageUrl && (
        <div className="absolute inset-0 pointer-events-none">
          <img src={visual.heroImageUrl} alt="" fetchPriority="high" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#0F172A]/70" />
        </div>
      )}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, var(--site-glow), transparent 65%)' }} />

      <div className="relative mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl preloader-logo"
          style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))', boxShadow: '0 0 40px var(--site-glow)' }}
        >
          <MousePointerClick size={28} className="text-white" />
        </div>
        <div
          className="absolute -inset-2 rounded-[22px] border-2 border-transparent preloader-ring"
          style={{ borderTopColor: 'var(--site-primary)', borderRightColor: 'color-mix(in srgb, var(--site-primary) 60%, transparent)' }}
        />
      </div>

      <p className="text-white font-bold text-xl tracking-tight mb-1">
        Jorstan<span style={{ color: 'var(--site-primary)' }}>Click</span>
      </p>
      <p className="text-[#94A3B8] text-xs font-medium tracking-wide mb-3">Compras Rápidas</p>
      <p className="text-[#94A3B8] text-sm">Cargando tu experiencia…</p>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
        <div className="h-full preloader-bar" style={{ background: 'linear-gradient(to right, var(--site-from), var(--site-to))' }} />
      </div>
    </div>
  );
}
