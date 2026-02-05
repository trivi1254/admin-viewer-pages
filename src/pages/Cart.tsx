import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { addOrder, addUserOrder, getUserProfile } from '@/lib/firebase';

import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

import { StoreHeader } from '@/components/store/StoreHeader';
import { StoreFooter } from '@/components/store/StoreFooter';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      const profile = await getUserProfile(user.uid);

      setCustomer({
        name: (profile && 'name' in profile ? String(profile.name) : null) || user.displayName || '',
        phone: (profile && 'phone' in profile ? String(profile.phone) : '') || '',
        address: (profile && 'address' in profile ? String(profile.address) : '') || ''
      });
    };

    loadUserProfile();
  }, [user]);

  const handleCheckout = async () => {
    // 🔴 OBLIGAR LOGIN
    if (!user) {
      toast.error('Debes iniciar sesión para realizar un pedido');
      navigate('/login');
      return;
    }

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
      const orderDate = new Date().toISOString();
      const orderId = `order_${Date.now()}`;

      const orderData = {
        userId: user.uid, // 🔥 CLAVE PARA FIRESTORE RULES
        customer,
        items: cart,
        total: getTotal(),
        status: 'pending' as const,
        date: orderDate
      };

      // 📦 Pedido general (admin)
      await addOrder(orderData);

      // 📁 Pedido del usuario
      await addUserOrder(user.uid, orderId, orderData);

      clearCart();
      toast.success('¡Pedido realizado con éxito! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      toast.error('No se pudo procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />

      <main className="flex-1 container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la tienda
          </Link>

          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary" />
            Mi Carrito
          </h1>

          {cart.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <ShoppingCart className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Tu carrito está vacío</h3>
                <Link to="/">
                  <Button>Ver productos</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* LISTA */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-16 w-16 flex items-center justify-center text-3xl">
                            {item.icon}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-primary font-bold">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus />
                            </Button>

                            <span className="w-6 text-center font-bold">
                              {item.quantity}
                            </span>

                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* RESUMEN */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos de envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={customer.name}
                        onChange={e =>
                          setCustomer({ ...customer, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input
                        value={customer.phone}
                        onChange={e =>
                          setCustomer({ ...customer, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Dirección</Label>
                      <Textarea
                        value={customer.address}
                        onChange={e =>
                          setCustomer({ ...customer, address: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="mr-2" />
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
