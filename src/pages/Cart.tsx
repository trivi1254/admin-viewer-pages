import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { addOrder } from '@/lib/firebase';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone || !customer.address) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      await addOrder({
        customer,
        items: cart,
        total: getTotal(),
        date: new Date().toISOString()
      });

      clearCart();
      toast.success('¡Pedido realizado con éxito! 🎉 Pronto nos contactaremos contigo.');
      navigate('/');
    } catch (error) {
      toast.error('Error al procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
      
      <main className="flex-1 container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>

          <h1 className="font-display text-3xl font-bold mb-8">
            <ShoppingCart className="inline-block mr-3 h-8 w-8 text-primary" />
            Mi Carrito
          </h1>

          {cart.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
                <p className="text-muted-foreground mb-6">
                  Explora nuestros productos y agrega algo al carrito
                </p>
                <Link to="/">
                  <Button className="gradient-primary text-primary-foreground">
                    Ver productos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence mode="popLayout">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl gradient-primary flex items-center justify-center text-3xl">
                              {item.icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{item.name}</h3>
                              <p className="text-lg font-bold text-primary">
                                ${item.price.toFixed(2)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              
                              <span className="w-8 text-center font-semibold">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="text-right min-w-[80px]">
                              <p className="font-bold">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.id)}
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

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datos de envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre completo *</Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        placeholder="0999999999"
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Dirección de entrega *</Label>
                      <Textarea
                        id="address"
                        placeholder="Calle, número, sector..."
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/30 shadow-glow">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen del pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} x{item.quantity}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">${getTotal().toFixed(2)}</span>
                    </div>

                    <Button
                      className="w-full gradient-primary text-primary-foreground gap-2"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5" />
                          Finalizar Compra
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <StoreFooter />
    </div>
  );
}
