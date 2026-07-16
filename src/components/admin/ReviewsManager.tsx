import { useState, useMemo } from 'react';
import { Sparkles, Eye, EyeOff, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { Badge } from './Badge';
import { StarRating } from '@/components/store/StarRating';
import { useReviews } from '@/hooks/useReviews';
import { useProducts } from '@/hooks/useProducts';
import { updateReview, deleteReview } from '@/lib/database';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'featured' | 'hidden';

export function ReviewsManager() {
  const { reviews, loading } = useReviews();
  const { products } = useProducts();
  const [filter, setFilter] = useState<Filter>('all');

  const productName = (productId: string) => products.find((p) => p.id === productId)?.name;

  const filtered = useMemo(() => {
    if (filter === 'featured') return reviews.filter((r) => r.featured);
    if (filter === 'hidden') return reviews.filter((r) => !r.visible);
    return reviews;
  }, [reviews, filter]);

  const toggle = async (id: string, field: 'visible' | 'featured', current: boolean) => {
    try {
      await updateReview(id, { [field]: !current });
    } catch {
      toast.error('Error al actualizar la reseña');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar esta reseña?')) {
      try {
        await deleteReview(id);
        toast.success('Reseña eliminada');
      } catch {
        toast.error('Error al eliminar la reseña');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'featured', 'hidden'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors border',
              filter === f ? 'border-transparent' : 'bg-card text-muted-foreground border-white/8 hover:text-foreground'
            )}
            style={filter === f ? { background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)', color: 'var(--site-primary)', borderColor: 'color-mix(in srgb, var(--site-primary) 30%, transparent)' } : undefined}
          >
            {f === 'all' ? `Todas (${reviews.length})` : f === 'featured' ? `⭐ Destacadas (${reviews.filter((r) => r.featured).length})` : `Ocultas (${reviews.filter((r) => !r.visible).length})`}
          </button>
        ))}
      </div>

      <div className="bg-card border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--site-primary)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={32} className="text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No hay reseñas en este filtro</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((r) => (
              <div key={r.id} className="p-5 hover:bg-white/3 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {r.author.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-medium">{r.author}</span>
                      <StarRating rating={r.rating} />
                      {r.createdAt && <span className="text-muted-foreground text-xs">· {new Date(r.createdAt).toLocaleDateString('es-ES')}</span>}
                      {r.featured && (
                        <Badge variant="info">
                          <Sparkles size={9} className="mr-0.5" /> Destacada
                        </Badge>
                      )}
                      {!r.visible && <Badge variant="warning">Oculta</Badge>}
                    </div>
                    {productName(r.productId) && (
                      <p className="text-muted-foreground text-xs mb-2">
                        En: <span style={{ color: 'var(--site-primary)' }}>{productName(r.productId)}</span>
                      </p>
                    )}
                    {r.text && <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggle(r.id, 'featured', r.featured)}
                      title={r.featured ? 'Quitar de destacadas' : 'Marcar como destacada'}
                      className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors border', r.featured ? 'border-transparent' : 'bg-white/5 border-white/8 text-muted-foreground hover:text-foreground')}
                      style={r.featured ? { background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)', color: 'var(--site-primary)' } : undefined}
                    >
                      <Sparkles size={13} />
                    </button>
                    <button
                      onClick={() => toggle(r.id, 'visible', r.visible)}
                      title={r.visible ? 'Ocultar reseña' : 'Mostrar reseña'}
                      className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-colors border', !r.visible ? 'bg-amber-500/15 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/8 text-muted-foreground hover:text-amber-400')}
                    >
                      {r.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
