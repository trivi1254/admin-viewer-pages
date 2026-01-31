import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { addProduct, deleteProduct } from '@/lib/firebase';
import { toast } from 'sonner';

export function ProductsManager() {
  const { products, loading } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    icon: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price) {
      toast.error('Nombre y precio son requeridos');
      return;
    }

    setIsSubmitting(true);

    try {
      await addProduct({
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        icon: newProduct.icon || '📦'
      });

      setNewProduct({ name: '', price: '', description: '', icon: '' });
      toast.success('¡Producto agregado exitosamente! 🎉');
    } catch (error) {
      toast.error('Error al agregar producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      try {
        await deleteProduct(id);
        toast.success('Producto eliminado');
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Add Product Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="border-border/50 shadow-card sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Agregar Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del producto *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Camisa Deportiva"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="price">Precio ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="19.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción del producto..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="icon">Emoji / Icono</Label>
                <Input
                  id="icon"
                  placeholder="🎽 o deja vacío"
                  value={newProduct.icon}
                  onChange={(e) => setNewProduct({ ...newProduct, icon: e.target.value })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full gradient-primary text-primary-foreground gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Agregar Producto
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products List */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Mis Productos ({products.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No hay productos. ¡Agrega el primero!
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="group hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center text-2xl shrink-0">
                                {product.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{product.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {product.description || 'Sin descripción'}
                                </p>
                                <p className="text-lg font-bold text-primary mt-1">
                                  ${product.price.toFixed(2)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(product.id, product.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
