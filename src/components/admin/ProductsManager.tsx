import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package, Loader2, Link as LinkIcon, CreditCard } from 'lucide-react'; // Añadimos iconos
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
  
  // 1. ACTUALIZAMOS EL ESTADO PARA INCLUIR IMAGE Y PAYMENTURL
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',       // Link de la imagen (ImgBB, etc)
    paymentUrl: ''   // Link de WhatsApp o Pago
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
    image: newProduct.image || 'https://via.placeholder.com/150', // Si no hay link, pone uno por defecto
    paymentUrl: newProduct.paymentUrl || '#'
  });

  // Limpiamos todos los campos después de guardar
  setNewProduct({ 
    name: '', 
    price: '', 
    description: '', 
    image: '', 
    paymentUrl: '' 
  });
  
  toast.success('¡Producto agregado con éxito! 🚀');
}catch (error) {
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

              {/* 3. NUEVO CAMPO: LINK DE LA IMAGEN */}
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

              {/* 4. NUEVO CAMPO: LINK DE PAGO / WHATSAPP */}
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

      {/* Lista de productos (Visualización) */}
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
                  {/* MOSTRAMOS LA IMAGEN DEL LINK */}
                  <div className="h-32 bg-muted relative overflow-hidden">
                    <img 
                      src={product.image || 'https://via.placeholder.com/150'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
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