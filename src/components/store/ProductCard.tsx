import { motion } from 'framer-motion';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Card className="overflow-hidden border-border/50 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/30">
        <div className="relative h-48 gradient-primary flex items-center justify-center overflow-hidden">
          <motion.span 
            className="text-6xl"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {product.icon || '📦'}
          </motion.span>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
