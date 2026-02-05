import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, ExternalLink, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/firebase';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`, {
      duration: 2000,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              {/* Image Section */}
              <div className="relative h-64 sm:h-72 bg-gradient-to-br from-[#1a3a5c] to-[#00d4aa] overflow-hidden">
                {product.image && product.image !== 'https://via.placeholder.com/150' ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl">{product.icon || '📦'}</span>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>

                {/* Category badge */}
                {product.category && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#00d4aa] text-white border-none px-3 py-1 text-sm">
                      <Tag className="h-3 w-3 mr-1" />
                      {product.category}
                    </Badge>
                  </div>
                )}

                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="text-3xl font-bold text-white">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-[#1a3a5c] mb-3">
                  {product.name}
                </h2>

                <p className="text-gray-600 leading-relaxed mb-6">
                  {product.description || 'Producto de excelente calidad. Disponible para compra inmediata.'}
                </p>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-white h-12 text-base"
                  >
                    <Plus className="h-5 w-5" />
                    <ShoppingCart className="h-5 w-5" />
                    Agregar al Carrito
                  </Button>

                  {product.paymentUrl && product.paymentUrl !== '#' && (
                    <a
                      href={product.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="h-12 gap-2 border-[#1a3a5c] text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white"
                      >
                        <ExternalLink className="h-5 w-5" />
                        Comprar
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
