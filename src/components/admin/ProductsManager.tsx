import { useState } from 'react';
import { Plus, Trash2, Package, Loader2, Pencil, X, Save } from 'lucide-react';
import { Btn } from '@/components/store/Btn';
import { Badge } from './Badge';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useReviews } from '@/hooks/useReviews';
import { StarRating } from '@/components/store/StarRating';
import { productGradient } from '@/lib/productGradient';
import { addProduct, deleteProduct, updateProduct, Product, ProductSpec } from '@/lib/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductForm {
  id?: string;
  name: string;
  price: string;
  originalPrice: string;
  category: string;
  badge: string;
  icon: string;
  description: string;
  specs: ProductSpec[];
  inStock: boolean;
}

const emptyForm: ProductForm = {
  name: '',
  price: '',
  originalPrice: '',
  category: '',
  badge: '',
  icon: '',
  description: '',
  specs: [],
  inStock: true,
};

const inputClass = 'w-full bg-background border border-white/8 rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors';
const labelClass = 'block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5';

export function ProductsManager() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { ratingsByProduct } = useReviews();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [modal, setModal] = useState<{ open: boolean; mode: 'add' | 'edit'; form: ProductForm }>({ open: false, mode: 'add', form: emptyForm });

  const openAdd = () => {
    setModal({ open: true, mode: 'add', form: emptyForm });
    setImages([]);
  };

  const openEdit = (p: Product) => {
    setModal({
      open: true,
      mode: 'edit',
      form: {
        id: p.id,
        name: p.name,
        price: p.price.toString(),
        originalPrice: p.originalPrice?.toString() || '',
        category: p.category || '',
        badge: p.badge || '',
        icon: p.icon || '',
        description: p.description || '',
        specs: p.specs || [],
        inStock: p.inStock,
      },
    });
    setImages(p.images?.length ? p.images : p.image ? [p.image] : []);
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSave = async () => {
    const { form } = modal;
    if (!form.name.trim() || !form.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanImages = images.map((i) => i.trim()).filter(Boolean);
      const payload: Partial<Product> = {
        name: form.name,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        category: form.category || 'Otro',
        badge: (form.badge || undefined) as Product['badge'],
        image: cleanImages[0] || 'https://via.placeholder.com/150',
        images: cleanImages,
        icon: form.icon,
        description: form.description,
        specs: form.specs.filter((s) => s.label.trim() || s.value.trim()),
        inStock: form.inStock,
      };
      if (modal.mode === 'add') {
        await addProduct(payload);
        toast.success('Producto agregado con éxito!');
      } else if (form.id) {
        await updateProduct(form.id, payload);
        toast.success('Producto actualizado con éxito!');
      }
      closeModal();
    } catch {
      toast.error('Error al guardar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Producto eliminado');
      } catch {
        toast.error('Error al eliminar producto');
      }
    }
  };

  const setForm = (patch: Partial<ProductForm>) => setModal((m) => ({ ...m, form: { ...m.form, ...patch } }));

  return (
    <div className="bg-card border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-white/8">
        <h3 className="font-semibold">Todos los Productos ({products.length})</h3>
        <Btn variant="primary" size="sm" onClick={openAdd}>
          <Plus size={13} /> Agregar Producto
        </Btn>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--site-primary)' }} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No hay productos todavía</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {products.map((product) => {
            const hasImage = product.image && product.image !== 'https://via.placeholder.com/150';
            const ratingInfo = ratingsByProduct.get(product.id);
            return (
              <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden border border-white/8 flex items-center justify-center',
                    !hasImage && `bg-gradient-to-br ${productGradient(product.id)}`
                  )}
                >
                  {hasImage ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <span className="text-xl">{product.icon || '📦'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-muted-foreground text-xs">{product.category || 'Sin categoría'}</p>
                </div>
                {ratingInfo ? (
                  <div className="hidden sm:flex items-center gap-3">
                    <StarRating rating={ratingInfo.rating} />
                    <span className="text-muted-foreground text-xs">({ratingInfo.count} reseñas)</span>
                  </div>
                ) : (
                  <span className="hidden sm:block text-muted-foreground text-xs">(0 reseñas)</span>
                )}
                <Badge variant={product.inStock ? 'success' : 'danger'}>{product.inStock ? 'En Stock' : 'Agotado'}</Badge>
                <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(product)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-orange-400 transition-colors" title="Editar">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors" title="Eliminar">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="font-semibold">{modal.mode === 'add' ? 'Agregar Producto' : 'Editar Producto'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Images */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={labelClass}>Imágenes del Producto</label>
                  <button
                    onClick={() => setImages([...images, ''])}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: 'var(--site-primary)' }}
                  >
                    <Plus size={12} /> Agregar imagen
                  </button>
                </div>
                <p className="text-muted-foreground text-xs mb-2">
                  La primera es la portada (se usa en tarjetas y carrito). Puedes agregar varias para la galería del producto. Deja todo vacío para usar el emoji.
                </p>
                {images.length === 0 ? (
                  <div
                    className={cn(
                      'w-24 h-24 rounded-xl flex-shrink-0 overflow-hidden border border-white/10 flex items-center justify-center bg-gradient-to-br',
                      productGradient(modal.form.id || 'new')
                    )}
                  >
                    <span className="text-3xl">{modal.form.icon || '📦'}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {images.map((url, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden border border-white/10 flex items-center justify-center',
                            !url && `bg-gradient-to-br ${productGradient(modal.form.id || 'new')}`
                          )}
                        >
                          {url ? (
                            <img
                              src={url}
                              alt={`preview ${i + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.style.opacity = '0.2')}
                            />
                          ) : (
                            <span className="text-lg">{modal.form.icon || '📦'}</span>
                          )}
                        </div>
                        <input
                          placeholder={i === 0 ? 'URL de la imagen principal…' : `URL de la imagen ${i + 1}…`}
                          value={url}
                          onChange={(e) => {
                            const next = [...images];
                            next[i] = e.target.value;
                            setImages(next);
                          }}
                          className={cn(inputClass, 'flex-1')}
                        />
                        <button
                          onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                          className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Nombre del Producto *</label>
                  <input value={modal.form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Nombre del producto" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Precio ($)</label>
                  <input type="number" min={0} value={modal.form.price} onChange={(e) => setForm({ price: e.target.value })} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Precio Original ($)</label>
                  <input type="number" min={0} value={modal.form.originalPrice} onChange={(e) => setForm({ originalPrice: e.target.value })} placeholder="Opcional" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Categoría</label>
                  <select value={modal.form.category} onChange={(e) => setForm({ category: e.target.value })} className={inputClass}>
                    <option value="">Seleccionar</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Badge</label>
                  <select value={modal.form.badge} onChange={(e) => setForm({ badge: e.target.value })} className={inputClass}>
                    <option value="">Ninguno</option>
                    <option value="Sale">Sale</option>
                    <option value="New">New</option>
                    <option value="Best Seller">Best Seller</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Ícono (emoji)</label>
                  <input value={modal.form.icon} onChange={(e) => setForm({ icon: e.target.value })} placeholder="📦" className={inputClass} />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setForm({ inStock: !modal.form.inStock })}
                      className={cn('w-10 h-6 rounded-full relative transition-colors cursor-pointer', modal.form.inStock ? '' : 'bg-white/20')}
                      style={modal.form.inStock ? { background: 'var(--site-primary)' } : undefined}
                    >
                      <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all', modal.form.inStock ? 'right-0.5' : 'left-0.5')} />
                    </div>
                    <span className="text-sm text-muted-foreground">En Stock</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={modal.form.description} onChange={(e) => setForm({ description: e.target.value })} placeholder="Describe el producto…" rows={3} className={cn(inputClass, 'resize-none')} />
              </div>

              {/* Specs editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Especificaciones</label>
                  <button
                    onClick={() => setForm({ specs: [...modal.form.specs, { label: '', value: '' }] })}
                    className="flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: 'var(--site-primary)' }}
                  >
                    <Plus size={12} /> Agregar spec
                  </button>
                </div>
                {modal.form.specs.length === 0 ? (
                  <p className="text-muted-foreground text-xs py-3 text-center border border-dashed border-white/10 rounded-xl">
                    Sin especificaciones — haz clic en "Agregar spec" para empezar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {modal.form.specs.map((spec, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={spec.label}
                          onChange={(e) => {
                            const specs = [...modal.form.specs];
                            specs[i] = { ...specs[i], label: e.target.value };
                            setForm({ specs });
                          }}
                          placeholder="Etiqueta (ej. Peso)"
                          className="flex-1 bg-background border border-white/8 rounded-xl px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors"
                        />
                        <input
                          value={spec.value}
                          onChange={(e) => {
                            const specs = [...modal.form.specs];
                            specs[i] = { ...specs[i], value: e.target.value };
                            setForm({ specs });
                          }}
                          placeholder="Valor (ej. 250g)"
                          className="flex-1 bg-background border border-white/8 rounded-xl px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors"
                        />
                        <button
                          onClick={() => setForm({ specs: modal.form.specs.filter((_, idx) => idx !== i) })}
                          className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Btn variant="secondary" className="flex-1" onClick={closeModal}>Cancelar</Btn>
                <Btn variant="primary" className="flex-1" onClick={handleSave} disabled={isSubmitting || !modal.form.name.trim()}>
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> {modal.mode === 'add' ? 'Agregar Producto' : 'Guardar Cambios'}</>}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
