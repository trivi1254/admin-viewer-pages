import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Loader2,
  Truck,
  User,
  Phone,
  MapPin,
  Package,
  DollarSign,
  Shield
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

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'whatsapp'>('paypal');
  const [paypalReady, setPaypalReady] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRendered = useRef(false);

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

  // Load PayPal SDK
  useEffect(() => {
    const PAYPAL_CLIENT_ID = 'ARmW_pHoGv6iXEXkvvXhJLkfkXEwBRvdRzt0dou2SNAEnUsPArDmrbfmvQVPJzM6vp9dk91_Hb9a30ed';

    if (document.querySelector('script[data-paypal-script]')) {
      if (window.paypal) {
        setPaypalReady(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
    script.setAttribute('data-paypal-script', 'true');
    script.async = true;
    script.onload = () => {
      setPaypalReady(true);
    };
    script.onerror = () => {
      console.error('Error loading PayPal SDK');
    };
    document.head.appendChild(script);
  }, []);

  // Render PayPal buttons when ready and method is selected
  useEffect(() => {
    if (
      paypalReady &&
      paymentMethod === 'paypal' &&
      paypalContainerRef.current &&
      window.paypal &&
      cart.length > 0 &&
      !paypalButtonsRendered.current
    ) {
      paypalContainerRef.current.innerHTML = '';
      paypalButtonsRendered.current = true;

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 45
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: `Pedido JorstanClick - ${cart.length} artículo(s)`,
              amount: {
                value: getTotal().toFixed(2)
              }
            }]
          });
        },
        onApprove: async (_data: any, actions: any) => {
          const details = await actions.order.capture();
          await processOrder('paypal', details.id);
        },
        onError: (err: any) => {
          console.error('PayPal Error:', err);
          toast.error('Error al procesar el pago con PayPal');
        }
      }).render(paypalContainerRef.current);
    }

    // Reset rendered flag when payment method changes or cart empties
    if (paymentMethod !== 'paypal' || cart.length === 0) {
      paypalButtonsRendered.current = false;
    }
  }, [paypalReady, paymentMethod, cart.length]);

  const processOrder = async (method: string, paypalTransactionId?: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar un pedido');
      navigate('/login');
      return;
    }

    if (!customer.name || !customer.phone || !customer.address) {
      toast.error('Por favor completa todos los campos de envío');
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
        userId: user.uid,
        customer,
        items: cart,
        total: getTotal(),
        status: 'pending' as const,
        date: orderDate,
        paymentMethod: method,
        ...(paypalTransactionId && { paypalTransactionId })
      };

      await addOrder(orderData);
      await addUserOrder(user.uid, orderId, orderData);

      clearCart();
      toast.success('Pedido realizado con éxito!');
      navigate('/');
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      toast.error('No se pudo procesar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = () => {
    processOrder('whatsapp');
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
              {/* LISTA DE PRODUCTOS */}
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
                          <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                            {item.image && item.image !== 'https://via.placeholder.com/150' ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-[#1a3a5c] to-[#00d4aa]">
                                {item.icon || <Package className="h-6 w-6 text-white" />}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{item.name}</h3>
                            <p className="text-primary font-bold">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-6 text-center font-bold">
                              {item.quantity}
                            </span>

                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="text-right min-w-[80px]">
                            <p className="font-bold text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* SIDEBAR - DATOS + RESUMEN + PAGO */}
              <div className="space-y-6">
                {/* Datos de envío */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Truck className="h-5 w-5 text-primary" />
                      Datos de Envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-1 mb-1">
                        <User className="h-3 w-3" /> Nombre completo
                      </Label>
                      <Input
                        placeholder="Tu nombre completo"
                        value={customer.name}
                        onChange={e =>
                          setCustomer({ ...customer, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1 mb-1">
                        <Phone className="h-3 w-3" /> Teléfono
                      </Label>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        value={customer.phone}
                        onChange={e =>
                          setCustomer({ ...customer, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="flex items-center gap-1 mb-1">
                        <MapPin className="h-3 w-3" /> Dirección de envío
                      </Label>
                      <Textarea
                        placeholder="Calle, número, ciudad, código postal..."
                        value={customer.address}
                        onChange={e =>
                          setCustomer({ ...customer, address: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Resumen del pedido */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Resumen del Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">
                          {item.name} x{item.quantity}
                        </span>
                        <span className="font-medium shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Método de pago */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Método de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Payment method selection */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-[#0070ba] bg-[#0070ba]/5'
                            : 'border-border hover:border-[#0070ba]/50'
                        }`}
                        onClick={() => setPaymentMethod('paypal')}
                      >
                        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
                          <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.283c-.527 0-.974.382-1.056.9L7.076 21.337z" fill="#253B80"/>
                          <path d="M20.16 7.035c-.01.06-.02.12-.034.18C19.07 12.79 15.68 14.53 11.383 14.53H9.283c-.527 0-.974.382-1.056.9l-1.178 7.466a.538.538 0 00.532.62h3.704c.46 0 .852-.334.924-.788l.038-.197.732-4.64.047-.256a.932.932 0 01.921-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.173-3.388-.777-4.471a3.71 3.71 0 00-1.065-.855z" fill="#179BD7"/>
                          <path d="M19.064 6.59a8.884 8.884 0 00-1.09-.245 13.876 13.876 0 00-2.2-.16H10.36a.932.932 0 00-.92.788L8.26 15.239l-.033.21a1.06 1.06 0 011.056-.9h2.153c4.298 0 7.687-1.745 8.67-6.797.03-.15.054-.295.077-.437a4.853 4.853 0 00-1.12-.724z" fill="#222D65"/>
                        </svg>
                        <span className="text-sm font-medium">PayPal</span>
                      </button>

                      <button
                        type="button"
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === 'whatsapp'
                            ? 'border-[#25D366] bg-[#25D366]/5'
                            : 'border-border hover:border-[#25D366]/50'
                        }`}
                        onClick={() => setPaymentMethod('whatsapp')}
                      >
                        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="#25D366">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        <span className="text-sm font-medium">WhatsApp</span>
                      </button>
                    </div>

                    {/* PayPal buttons */}
                    {paymentMethod === 'paypal' && (
                      <div className="space-y-3">
                        {!paypalReady && (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Cargando PayPal...</span>
                          </div>
                        )}
                        <div ref={paypalContainerRef} />
                      </div>
                    )}

                    {/* WhatsApp checkout */}
                    {paymentMethod === 'whatsapp' && (
                      <Button
                        className="w-full h-12 bg-[#25D366] hover:bg-[#1ebe57] text-white gap-2"
                        size="lg"
                        onClick={handleWhatsAppCheckout}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            Finalizar por WhatsApp
                          </>
                        )}
                      </Button>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                      <Shield className="h-3 w-3" />
                      <span>Pago seguro y protegido</span>
                    </div>
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
