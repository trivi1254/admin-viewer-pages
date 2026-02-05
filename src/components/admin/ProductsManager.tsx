import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package, Loader2, Link as LinkIcon, CreditCard, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { addProduct, deleteProduct } from '@/lib/firebase';
import { toast } from 'sonner';

const PRODUCT_CATEGORIES = [
  'Electrónica',
  'Ropa',
  'Hogar',
  'Deportes',
  'Belleza',
  'Juguetes',
  'Alimentos',
  'Accesorios',
  'Otro'
];

export function ProductsManager() {
  const { products, loading } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    paymentUrl: '',
    category: ''
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
        image: newProduct.image || 'https://via.placeholder.com/150',
        paymentUrl: newProduct.paymentUrl || '#',
        category: newProduct.category || 'Otro'
      });

      setNewProduct({
        name: '',
        price: '',
        description: '',
        image: '',
        paymentUrl: '',
        category: ''
      });

      toast.success('Producto agregado con éxito!');
    } catch (error) {
      toast.error('Error al agregar el producto');
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
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Card className="border-border/50 shadow-card sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Nuevo Producto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre del producto *</Label>
                <Input
                  placeholder="Ej: Camisa Urban"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Precio ($) *</Label>
                <Input
                  type="number"
                  placeholder="19.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Categoría
                </Label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Seleccionar categoría</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" /> URL de la Imagen (ImgBB)
                </Label>
                <Input
                  placeholder="Pega el link .jpg o .png aquí"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
              </div>

              <div>
                <Label className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Link de Pago o WhatsApp
                </Label>
                <Input
                  placeholder="https://wa.me/tu_numero"
                  value={newProduct.paymentUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, paymentUrl: e.target.value })}
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Detalles del producto..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full gradient-primary gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Guardar Producto</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de productos */}
      <div className="lg:col-span-2">
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Mis Productos ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group">
                  <div className="h-32 bg-muted relative overflow-hidden">
                    <img
                      src={product.image || 'https://via.placeholder.com/150'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.category && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#00d4aa] text-white text-xs rounded-full">
                        {product.category}
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{product.name}</h4>
                        <p className="text-primary font-bold">${product.price.toFixed(2)}</p>
                      </div>
                      <button className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors" onClick={() => handleDelete(product.id, product.name)}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}