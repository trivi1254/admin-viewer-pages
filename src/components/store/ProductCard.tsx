import { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/lib/database';
import { useCart } from '@/contexts/CartContext';
import { productGradient } from '@/lib/productGradient';
import { StarRating } from './StarRating';
import { Btn } from './Btn';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
  rating?: number;
  reviewCount?: number;
}

const BADGE_STYLES: Record<string, string> = {
  Sale: 'bg-red-500/15 text-red-400',
  New: 'bg-green-500/15 text-green-400',
  'Best Seller': 'bg-blue-500/15 text-blue-400',
};

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(function ProductCard(
  { product, rating, reviewCount },
  ref
) {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const hasImage = product.image && product.image !== 'https://via.placeholder.com/150';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`, { duration: 2000 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((w) => !w);
  };

  return (
    <div
      ref={ref}
      className="group relative flex flex-col bg-card border border-white/8 rounded-2xl overflow-hidden hover:border-white/16 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
    >
      <Link to={`/product/${product.id}`} className="contents">
        <div
          className={cn('relative h-52 flex items-center justify-center overflow-hidden', !hasImage && `bg-gradient-to-br ${productGradient(product.id)}`)}
        >
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-300">
              {product.icon || '📦'}
            </span>
          )}

          {product.badge && (
            <div className="absolute top-3 left-3">
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', BADGE_STYLES[product.badge])}>
                {product.badge}
              </span>
            </div>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
          >
            <Heart size={14} className={wishlisted ? 'fill-rose-400 text-rose-400' : 'text-white/60'} />
          </button>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-sm font-medium text-white/60">Agotado</span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-4 gap-3">
          <div>
            {product.category && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
            )}
            <h3 className="font-semibold text-sm leading-snug line-clamp-1">{product.name}</h3>
          </div>

          {rating !== undefined && reviewCount !== undefined && reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>}
          </div>
        </div>
      </Link>

      <div className="flex gap-2 px-4 pb-4">
        <Link to={`/product/${product.id}`} className="flex-1">
          <Btn variant="secondary" size="sm" className="w-full">
            Ver
          </Btn>
        </Link>
        <Btn variant="primary" size="sm" className="flex-1" onClick={handleAddToCart} disabled={!product.inStock}>
          <ShoppingCart size={13} /> Agregar
        </Btn>
      </div>
    </div>
  );
});
