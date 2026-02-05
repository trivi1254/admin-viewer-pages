import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index: number;
  onClick?: () => void;
}

export function ProductCard({ product, index, onClick }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`, {
      duration: 2000,
    });
  };

  const hasImage = product.image && product.image !== 'https://via.placeholder.com/150';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-border/50 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/30 h-full">
        <div className="relative h-48 overflow-hidden">
          {hasImage ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full gradient-primary flex items-center justify-center">
              <motion.span
                className="text-6xl"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {product.icon || '\uD83D\uDCE6'}
              </motion.span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Category badge */}
          {product.category && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#00d4aa]/90 text-white border-none text-xs px-2 py-0.5">
                <Tag className="h-3 w-3 mr-1" />
                {product.category}
              </Badge>
            </div>
          )}

          {/* View detail hint */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <Eye className="h-6 w-6 text-[#1a3a5c]" />
            </div>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
            {product.description || 'Producto de excelente calidad'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Precio</span>
              <span className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              className="gap-2 gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
            >
              <Plus className="h-4 w-4" />
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
