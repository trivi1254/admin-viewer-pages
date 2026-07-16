import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Check, Grid, List, Package, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useReviews } from '@/hooks/useReviews';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/store/ProductCard';
import { StarRating } from '@/components/store/StarRating';
import { Btn } from '@/components/store/Btn';
import { productGradient } from '@/lib/productGradient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Shop() {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { ratingsByProduct } = useReviews();
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todos');
  const [sort, setSort] = useState('featured');
  const [priceMax, setPriceMax] = useState(500);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

  const cats = ['Todos', ...categories.map((c) => c.name)];

  const filtered = useMemo(() => {
    return products
      .filter((p) => selectedCat === 'Todos' || p.category === selectedCat)
      .filter((p) => p.price <= priceMax)
      .filter((p) => !inStockOnly || p.inStock)
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating') return (ratingsByProduct.get(b.id)?.rating || 0) - (ratingsByProduct.get(a.id)?.rating || 0);
        return 0;
      });
  }, [products, selectedCat, priceMax, inStockOnly, search, sort, ratingsByProduct]);

  const handleAddToCart = (e: React.MouseEvent, product: (typeof products)[number]) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`, { duration: 2000 });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold text-sm mb-3">Categorías</h4>
        <div className="space-y-1">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                selectedCat === c ? 'bg-blue-500/15 text-blue-400' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
              style={selectedCat === c ? { background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)', color: 'var(--site-primary)' } : undefined}
            >
              {c}
              {selectedCat === c && <Check size={13} />}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Precio máximo: ${priceMax}</h4>
        <input
          type="range"
          min={10}
          max={500}
          value={priceMax}
          onChange={(e) => setPriceMax(+e.target.value)}
          className="w-full accent-[var(--site-primary)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>$10</span>
          <span>$500</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Disponibilidad</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            <input type="radio" name="avail" className="accent-[var(--site-primary)]" checked={inStockOnly} onChange={() => setInStockOnly(true)} />
            Solo en stock
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
            <input type="radio" name="avail" className="accent-[var(--site-primary)]" checked={!inStockOnly} onChange={() => setInStockOnly(false)} />
            Todos los artículos
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Tienda</h1>
        <p className="text-muted-foreground text-sm">{filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Mobile filter toggle */}
      <div className="flex gap-3 mb-6 lg:hidden">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-white/8 rounded-xl text-sm text-muted-foreground"
        >
          <SlidersHorizontal size={14} /> Filtros
        </button>
      </div>

      {filterOpen && (
        <div className="lg:hidden bg-card border border-white/8 rounded-2xl p-5 mb-6">
          <FilterPanel />
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="bg-card border border-white/8 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold mb-5 flex items-center gap-2">
              <SlidersHorizontal size={15} style={{ color: 'var(--site-primary)' }} /> Filtros
            </h3>
            <FilterPanel />
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos…"
                className="w-full bg-card border border-white/8 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--site-primary)]/50"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-card border border-white/8 rounded-xl px-3 py-2.5 text-sm text-muted-foreground focus:outline-none cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor valorados</option>
            </select>
            <div className="flex gap-1 bg-card border border-white/8 rounded-xl p-1">
              <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-colors', view === 'grid' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <Grid size={14} />
              </button>
              <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-colors', view === 'list' ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                <List size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--site-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Package size={40} className="text-muted-foreground mb-4" />
              <p className="font-medium">No se encontraron productos</p>
              <p className="text-muted-foreground text-sm mt-1">Intenta ajustar los filtros</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} rating={ratingsByProduct.get(p.id)?.rating} reviewCount={ratingsByProduct.get(p.id)?.count} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => {
                const hasImage = p.image && p.image !== 'https://via.placeholder.com/150';
                const ratingInfo = ratingsByProduct.get(p.id);
                return (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    className="flex gap-4 bg-card border border-white/8 rounded-2xl p-4 hover:border-white/16 transition-colors"
                  >
                    <div className={cn('w-24 h-24 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden', !hasImage && `bg-gradient-to-br ${productGradient(p.id)}`)}>
                      {hasImage ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{p.icon || '📦'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                        <h3 className="font-semibold text-sm mt-0.5">{p.name}</h3>
                        {ratingInfo && (
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={ratingInfo.rating} />
                            <span className="text-xs text-muted-foreground">({ratingInfo.count})</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold">${p.price.toFixed(2)}</span>
                        <Btn size="sm" variant="primary" onClick={(e) => handleAddToCart(e, p)}>
                          <ShoppingCart size={12} /> Agregar
                        </Btn>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
