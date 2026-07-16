import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Minus, Plus, Truck, RefreshCw, Lock, Star, MessageSquare, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useProductReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';
import { ProductCard } from '@/components/store/ProductCard';
import { StarRating } from '@/components/store/StarRating';
import { Btn } from '@/components/store/Btn';
import { productGradient } from '@/lib/productGradient';
import { addReview } from '@/lib/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const galleryImages = useMemo(
    () => (product?.images?.length ? product.images : product?.image ? [product.image] : []),
    [product]
  );

  useEffect(() => {
    setActiveImage(0);
  }, [id]);
  const { reviews } = useProductReviews(product?.id);
  const visibleReviews = reviews.filter((r) => r.visible);
  const featuredReviews = visibleReviews.filter((r) => r.featured);
  const avgRating = visibleReviews.length
    ? visibleReviews.reduce((s, r) => s + r.rating, 0) / visibleReviews.length
    : 0;

  const related = useMemo(() => {
    if (!product) return [];
    return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  }, [products, product]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(`${product.name} agregado al carrito`, { duration: 2000 });
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product);
    navigate('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    if (!user) {
      toast.error('Debes iniciar sesión para dejar una reseña');
      return;
    }
    if (!reviewForm.text.trim()) {
      toast.error('Escribe un comentario para tu reseña');
      return;
    }
    setSubmitting(true);
    try {
      await addReview({
        productId: product.id,
        author: user.displayName || user.email?.split('@')[0] || 'Usuario',
        rating: reviewForm.rating,
        text: reviewForm.text,
      });
      setReviewForm({ rating: 5, text: '' });
      toast.success('¡Gracias por tu reseña!');
    } catch {
      toast.error('No se pudo enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--site-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Package size={40} className="mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Producto no encontrado</h1>
        <p className="text-muted-foreground mb-6">Este producto ya no está disponible.</p>
        <Link to="/shop">
          <Btn variant="primary">Volver a la tienda</Btn>
        </Link>
      </div>
    );
  }

  const hasImage = galleryImages.length > 0 && galleryImages[0] !== 'https://via.placeholder.com/150';
  const gradient = productGradient(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-foreground transition-colors">Tienda</Link>
        <ChevronRight size={12} />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div>
          <div
            className={cn(
              'aspect-square rounded-3xl overflow-hidden mb-4 border border-white/8',
              !hasImage && `bg-gradient-to-br ${gradient} flex items-center justify-center`
            )}
          >
            {hasImage ? (
              <img src={galleryImages[activeImage] ?? galleryImages[0]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-9xl">{product.icon || '📦'}</span>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    'aspect-square rounded-xl border overflow-hidden transition-colors',
                    activeImage === i ? 'border-[var(--site-primary)]' : 'border-white/10 hover:border-white/30'
                  )}
                >
                  <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div>
            {product.category && (
              <span className="text-sm font-medium uppercase tracking-widest" style={{ color: 'var(--site-primary)' }}>
                {product.category}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold mt-1">{product.name}</h1>
          </div>

          {visibleReviews.length > 0 && (
            <div className="flex items-center gap-3">
              <StarRating rating={avgRating} />
              <span className="text-muted-foreground text-sm">
                {avgRating.toFixed(1)} · {visibleReviews.length} reseña{visibleReviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description || 'Producto de excelente calidad. Disponible para compra inmediata.'}
          </p>

          <div className="flex items-center gap-4 py-5 border-t border-b border-white/8">
            <span className="text-muted-foreground text-sm">Cantidad</span>
            <div className="flex items-center gap-1 bg-card rounded-xl border border-white/8 p-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-muted-foreground transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-10 text-center font-medium text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-lg hover:bg-white/8 flex items-center justify-center text-muted-foreground transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <span className={cn('text-sm font-medium', product.inStock ? 'text-green-400' : 'text-red-400')}>
              {product.inStock ? 'En Stock' : 'Agotado'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Btn size="lg" variant="primary" className="flex-1" onClick={handleAddToCart} disabled={!product.inStock}>
              <ShoppingCart size={16} /> Agregar al carrito
            </Btn>
            <Btn size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow} disabled={!product.inStock}>
              Comprar ahora
            </Btn>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Truck, label: 'Envío gratis desde $75' },
              { icon: RefreshCw, label: 'Devoluciones 30 días' },
              { icon: Lock, label: 'Pago seguro' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 bg-card rounded-xl border border-white/8 text-center">
                <Icon size={16} style={{ color: 'var(--site-primary)' }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex gap-1 border-b border-white/8 mb-8">
          {(['description', ...(product.specs && product.specs.length > 0 ? ['specs' as const] : []), 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                tab === t ? 'text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
              style={tab === t ? { borderColor: 'var(--site-primary)' } : undefined}
            >
              {t === 'description' ? 'Descripción' : t === 'specs' ? 'Especificaciones' : `Reseñas (${visibleReviews.length})`}
            </button>
          ))}
        </div>

        {tab === 'description' && (
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            {product.description || 'Producto de excelente calidad, verificado antes de su publicación en la tienda.'}
          </p>
        )}

        {tab === 'specs' && product.specs && (
          <div className="max-w-md space-y-3">
            {product.specs.map((s) => (
              <div key={s.label} className="flex justify-between py-3 border-b border-white/8">
                <span className="text-muted-foreground text-sm">{s.label}</span>
                <span className="text-sm font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="max-w-2xl space-y-6">
            {featuredReviews.length > 0 && (
              <div
                className="rounded-2xl p-5 border"
                style={{
                  background: 'linear-gradient(to right, color-mix(in srgb, var(--site-primary) 10%, transparent), color-mix(in srgb, var(--site-to) 10%, transparent))',
                  borderColor: 'color-mix(in srgb, var(--site-primary) 20%, transparent)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star size={14} style={{ color: 'var(--site-primary)' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--site-primary)' }}>
                    Reseñas destacadas
                  </span>
                </div>
                <div className="space-y-4">
                  {featuredReviews.map((r) => (
                    <div key={r.id} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
                        >
                          {r.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{r.author}</p>
                          <StarRating rating={r.rating} />
                        </div>
                      </div>
                      {r.text && <p className="text-sm leading-relaxed text-muted-foreground">"{r.text}"</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visibleReviews.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-sm">Aún no hay reseñas</p>
                <p className="text-muted-foreground text-xs mt-1">Sé el primero en compartir tu experiencia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleReviews.map((r) => (
                  <div key={r.id} className="bg-card rounded-2xl p-5 border border-white/8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{r.author}</p>
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    {r.text && <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-card border border-white/8 rounded-2xl p-5">
              <h4 className="font-semibold text-sm mb-4">Deja tu reseña</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Calificación</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setReviewForm((f) => ({ ...f, rating: s }))}>
                        <Star size={18} className={s <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20 hover:text-amber-400/50'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Tu reseña</label>
                  <textarea
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))}
                    placeholder="Cuéntanos tu experiencia con este producto..."
                    rows={3}
                    className="w-full bg-background border border-white/8 rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors resize-none"
                  />
                </div>
                <Btn variant="primary" size="sm" onClick={handleSubmitReview} disabled={submitting || !reviewForm.text.trim()}>
                  Enviar reseña
                </Btn>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
