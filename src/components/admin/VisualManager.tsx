import { useState, useEffect } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Toggle } from './Toggle';
import { useSiteVisual } from '@/hooks/useSiteVisual';
import { updateSiteVisual } from '@/lib/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const BG_PRESETS = [
  { id: 'default', label: 'Predeterminado', emoji: '🌑', desc: 'Oscuro minimalista', heroFrom: '#0F172A', heroTo: '#1E293B' },
  { id: 'christmas', label: 'Navidad', emoji: '🎄', desc: 'Rojo y verde festivo', heroFrom: '#1a0000', heroTo: '#001a07' },
  { id: 'halloween', label: 'Halloween', emoji: '🎃', desc: 'Naranja y negro', heroFrom: '#1a0800', heroTo: '#0a0a0a' },
  { id: 'newyear', label: 'Año Nuevo', emoji: '🎆', desc: 'Dorado y medianoche', heroFrom: '#120d00', heroTo: '#06000f' },
  { id: 'valentine', label: 'San Valentín', emoji: '💘', desc: 'Rosa y rojo intenso', heroFrom: '#1a000d', heroTo: '#0f0018' },
  { id: 'summer', label: 'Verano', emoji: '☀️', desc: 'Cielo y océano', heroFrom: '#001626', heroTo: '#00120e' },
  { id: 'blackfriday', label: 'Black Friday', emoji: '🖤', desc: 'Dorado y negro', heroFrom: '#0a0a0a', heroTo: '#130d00' },
];

const BANNER_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#0EA5E9', '#EF4444'];

const inputClass = 'w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors';

export function VisualManager() {
  const { visual, loading } = useSiteVisual();
  const [form, setForm] = useState(visual);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(visual);
  }, [visual]);

  const persist = async (next: typeof form) => {
    setForm(next);
    try {
      await updateSiteVisual(next);
    } catch {
      toast.error('No se pudo guardar la configuración');
    }
  };

  const handleSaveText = async () => {
    setIsSaving(true);
    try {
      await updateSiteVisual(form);
      toast.success('Configuración visual actualizada');
    } catch {
      toast.error('No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--site-primary)' }} />
      </div>
    );
  }

  const activePreset = BG_PRESETS.find((p) => p.id === form.bgPreset) || BG_PRESETS[0];

  return (
    <div className="space-y-6">
      {/* Live preview strip */}
      <div
        className="rounded-2xl border border-white/10 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${activePreset.heroFrom}, ${activePreset.heroTo})` }}
      >
        <div className="px-6 py-5 flex items-center gap-4 flex-wrap">
          <span className="text-3xl">{activePreset.emoji}</span>
          <div>
            <p className="font-semibold">Vista previa — {activePreset.label}</p>
            <p className="text-white/50 text-xs">{activePreset.desc}</p>
          </div>
          {form.bannerEnabled && (
            <div className="ml-auto px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: form.bannerColor }}>
              Banner activo
            </div>
          )}
          {form.promoEnabled && (
            <div className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-amber-500/30 text-amber-300 border border-amber-500/30">
              Promo activa — {form.promoCode}
            </div>
          )}
        </div>
      </div>

      {/* Custom hero background image */}
      <div className="bg-card border border-white/8 rounded-2xl p-5 space-y-3">
        <div>
          <h3 className="font-semibold">Imagen de Fondo del Hero</h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            Opcional. Si la dejas vacía, se usa el gradiente del tema estacional de abajo. Útil para ir cambiando la portada del sitio (ej. una foto por temporada) sin tocar código.
          </p>
        </div>
        <input
          placeholder="Pega la URL de una imagen (.jpg, .png, .webp)…"
          value={form.heroImageUrl || ''}
          onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
          onBlur={handleSaveText}
          className={inputClass}
        />
        {form.heroImageUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[21/9] relative">
            <img src={form.heroImageUrl} alt="Vista previa del fondo" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <button
              onClick={() => persist({ ...form, heroImageUrl: '' })}
              className="absolute top-3 right-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              Quitar imagen
            </button>
          </div>
        )}
      </div>

      {/* Seasonal presets */}
      <div className="bg-card border border-white/8 rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="font-semibold">Tema Estacional</h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            Cambia el gradiente del hero en el landing. {form.heroImageUrl ? 'Se usa detrás de tu imagen de fondo como respaldo.' : 'Visible para todos de inmediato.'}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BG_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => persist({ ...form, bgPreset: preset.id })}
              className={cn(
                'relative flex flex-col items-start gap-2 p-4 rounded-2xl border transition-all duration-200 text-left overflow-hidden text-white',
                form.bgPreset === preset.id ? 'border-white/30 ring-2 ring-white/20 scale-[1.02]' : 'border-white/8 hover:border-white/20'
              )}
              style={{ background: `linear-gradient(135deg, ${preset.heroFrom}, ${preset.heroTo})` }}
            >
              <span className="text-2xl">{preset.emoji}</span>
              <div>
                <p className="text-sm font-semibold leading-tight">{preset.label}</p>
                <p className="text-white/50 text-[11px]">{preset.desc}</p>
              </div>
              {form.bgPreset === preset.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check size={11} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Announcement banner */}
      <div className="bg-card border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Banner de Anuncio</h3>
            <p className="text-muted-foreground text-xs mt-0.5">Franja delgada mostrada arriba del sitio.</p>
          </div>
          <Toggle on={form.bannerEnabled} onToggle={() => persist({ ...form, bannerEnabled: !form.bannerEnabled })} />
        </div>
        <div className={cn('space-y-3 transition-opacity', !form.bannerEnabled && 'opacity-40 pointer-events-none')}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Texto del banner</label>
            <input value={form.bannerText} onChange={(e) => setForm({ ...form, bannerText: e.target.value })} onBlur={handleSaveText} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {BANNER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => persist({ ...form, bannerColor: c })}
                  className={cn('w-8 h-8 rounded-xl border-2 transition-all', form.bannerColor === c ? 'border-white/60 scale-110' : 'border-transparent hover:border-white/30')}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          {form.bannerText && (
            <div className="rounded-xl py-2 px-4 text-center text-sm font-medium text-white" style={{ background: form.bannerColor }}>
              {form.bannerText}
            </div>
          )}
        </div>
      </div>

      {/* Promotion */}
      <div className="bg-card border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Promoción Activa</h3>
            <p className="text-muted-foreground text-xs mt-0.5">Tarjeta de promo mostrada en el hero para todos los visitantes.</p>
          </div>
          <Toggle on={form.promoEnabled} onToggle={() => persist({ ...form, promoEnabled: !form.promoEnabled })} />
        </div>
        <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity', !form.promoEnabled && 'opacity-40 pointer-events-none')}>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Título</label>
            <input value={form.promoTitle} onChange={(e) => setForm({ ...form, promoTitle: e.target.value })} onBlur={handleSaveText} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Descuento</label>
            <input value={form.promoDiscount} onChange={(e) => setForm({ ...form, promoDiscount: e.target.value })} onBlur={handleSaveText} placeholder="Ej: 25%" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Código</label>
            <input value={form.promoCode} onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })} onBlur={handleSaveText} placeholder="VERANO25" className={cn(inputClass, 'font-mono')} />
          </div>
        </div>
        {form.promoEnabled && form.promoTitle && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 flex items-center gap-4">
            <div className="text-3xl font-black text-amber-400">{form.promoDiscount}</div>
            <div>
              <p className="font-semibold">{form.promoTitle}</p>
              {form.promoCode && (
                <p className="text-muted-foreground text-xs mt-0.5">
                  Usa el código <span className="font-mono text-amber-400 font-bold">{form.promoCode}</span> al pagar
                </p>
              )}
            </div>
          </div>
        )}
        <button onClick={handleSaveText} className="text-xs font-medium hover:opacity-80" style={{ color: 'var(--site-primary)' }} disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar texto de banner/promoción'}
        </button>
      </div>

      <div className="bg-card border border-white/8 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={15} style={{ color: 'var(--site-primary)' }} className="flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          Los cambios visuales aplican <strong className="text-foreground">de inmediato</strong> para los visitantes. No hay borrador/publicación — cambian en vivo al activarlos.
        </p>
      </div>
    </div>
  );
}
