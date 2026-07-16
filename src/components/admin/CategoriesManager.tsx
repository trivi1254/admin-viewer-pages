import { useState } from 'react';
import { Plus, Trash2, Layers, Loader2, Pencil, X, AlertCircle } from 'lucide-react';
import { Btn } from '@/components/store/Btn';
import { useCategories } from '@/hooks/useCategories';
import { addCategory, updateCategory, deleteCategory, Category } from '@/lib/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const GRADIENT_OPTIONS = [
  { label: 'Azul', gradient: 'from-blue-500/20 to-indigo-600/20', border: 'border-blue-500/20' },
  { label: 'Púrpura', gradient: 'from-violet-500/20 to-purple-600/20', border: 'border-violet-500/20' },
  { label: 'Verde', gradient: 'from-green-500/20 to-emerald-600/20', border: 'border-green-500/20' },
  { label: 'Ámbar', gradient: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/20' },
  { label: 'Rosa', gradient: 'from-rose-500/20 to-pink-600/20', border: 'border-rose-500/20' },
  { label: 'Cyan', gradient: 'from-cyan-500/20 to-sky-600/20', border: 'border-cyan-500/20' },
];

const inputClass = 'w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors';

export function CategoriesManager() {
  const { categories, loading } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Category> & { gradient?: string; border?: string } }>({ open: false, data: {} });

  const openAdd = () => setModal({ open: true, data: { gradient: GRADIENT_OPTIONS[0].gradient, border: GRADIENT_OPTIONS[0].border } });
  const openEdit = (cat: Category & { gradient?: string; border?: string }) => setModal({ open: true, data: { ...cat } });
  const closeModal = () => setModal({ open: false, data: {} });

  const handleSave = async () => {
    if (!modal.data.name?.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    setIsSubmitting(true);
    try {
      if (modal.data.id) {
        await updateCategory(modal.data.id, { name: modal.data.name, icon: modal.data.icon, image: modal.data.image });
        toast.success('Categoría actualizada');
      } else {
        await addCategory({ name: modal.data.name, icon: modal.data.icon, image: modal.data.image, sortOrder: categories.length });
        toast.success('Categoría creada');
      }
      closeModal();
    } catch {
      toast.error('Error al guardar la categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar la categoría "${name}"?`)) {
      try {
        await deleteCategory(id);
        toast.success('Categoría eliminada');
      } catch {
        toast.error('Error al eliminar la categoría');
      }
    }
  };

  const selectedGradientOpt = GRADIENT_OPTIONS.find((o) => o.gradient === modal.data.gradient) || GRADIENT_OPTIONS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-semibold">Gestión de Categorías</h2>
          <p className="text-muted-foreground text-xs mt-0.5">Los cambios aparecen al instante en la tienda y sus filtros.</p>
        </div>
        <Btn variant="primary" size="sm" onClick={openAdd}>
          <Plus size={13} /> Nueva Categoría
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--site-primary)' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => {
            const opt = GRADIENT_OPTIONS[i % GRADIENT_OPTIONS.length];
            return (
              <div key={cat.id} className={cn('relative rounded-2xl border bg-gradient-to-br p-5 flex items-center gap-4 overflow-hidden', opt.gradient, opt.border)}>
                {cat.image && <img src={cat.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />}
                <div className="relative z-10 flex-shrink-0">
                  {cat.image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span className="text-3xl">{cat.icon || '🏷️'}</span>
                  )}
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <p className="font-semibold truncate">{cat.name}</p>
                </div>
                <div className="relative z-10 flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.name)} className="w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Layers size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No hay categorías todavía. Agrega una arriba.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-card border border-white/8 rounded-2xl p-4 flex items-start gap-3 mt-2">
        <AlertCircle size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          Renombrar una categoría aquí <strong className="text-foreground">no</strong> actualiza automáticamente los productos existentes. Edita los productos afectados por separado.
        </p>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="font-semibold">{modal.data.id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Nombre *</label>
                <input value={modal.data.name || ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))} placeholder="Ej: Electrónica" className={inputClass} />
              </div>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Imagen (opcional)</label>
                  <input value={modal.data.image || ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, image: e.target.value } }))} placeholder="https://…/foto.jpg" className={inputClass} />
                </div>
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Emoji</label>
                  <input value={modal.data.icon || ''} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, icon: e.target.value } }))} placeholder="⚡" className="w-20 bg-background border border-white/8 rounded-xl px-3 py-2.5 text-lg text-center focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors" />
                </div>
              </div>

              <div className={cn('relative rounded-xl border overflow-hidden h-24 bg-gradient-to-br flex items-center justify-center gap-3', selectedGradientOpt.gradient, selectedGradientOpt.border)}>
                {modal.data.image ? (
                  <>
                    <img src={modal.data.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <div className="relative z-10 text-center">
                      <p className="font-semibold text-sm drop-shadow">{modal.data.name || 'Vista previa'}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <span className="text-3xl">{modal.data.icon || '📦'}</span>
                    <p className="font-semibold text-sm mt-1">{modal.data.name || 'Vista previa'}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tema de color</label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADIENT_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => setModal((m) => ({ ...m, data: { ...m.data, gradient: opt.gradient, border: opt.border } }))}
                      className={cn(
                        'rounded-xl py-2 text-xs font-medium border bg-gradient-to-br transition-all',
                        opt.gradient,
                        opt.border,
                        modal.data.gradient === opt.gradient ? 'ring-2 ring-white/30 scale-[1.03]' : 'opacity-70 hover:opacity-100'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Btn variant="secondary" className="flex-1" onClick={closeModal}>Cancelar</Btn>
                <Btn variant="primary" className="flex-1" onClick={handleSave} disabled={isSubmitting || !modal.data.name?.trim()}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : modal.data.id ? 'Guardar Cambios' : 'Agregar Categoría'}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
