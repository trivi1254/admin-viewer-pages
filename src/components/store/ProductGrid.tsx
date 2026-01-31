import { motion } from 'framer-motion';
import { Package, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useProducts } from '@/hooks/useProducts';

export function ProductGrid() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Tienda vacía</h3>
        <p className="text-muted-foreground">
          Pronto tendremos productos increíbles para ti. ¡Vuelve pronto!
        </p>
      </motion.div>
    );
  }

  return (
    <section className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="font-display text-3xl font-bold mb-3">
          Nuestros <span className="text-gradient">Productos</span>
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Explora nuestra selección de productos de alta calidad
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
