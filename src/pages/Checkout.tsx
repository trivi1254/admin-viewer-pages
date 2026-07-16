import { useState, useEffect } from 'react';
import { Check, MapPin, CreditCard, ChevronLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, addOrder } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import { Btn } from '@/components/store/Btn';
import { productGradient } from '@/lib/productGradient';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

type Step = 'shipping' | 'payment';

const steps: { id: Step; n: number; label: string }[] = [
  { id: 'shipping', n: 1, label: 'Envío' },
  { id: 'payment', n: 2, label: 'Pago' },
];

const InputField = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-muted-foreground mb-1.5">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--site-primary)]/50 transition-colors"
    />
  </div>
);

export default function CheckoutPage() {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<Step>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'whatsapp'>('stripe');

  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });

  const subtotal = getTotal();
  const shipping = subtotal > 75 ? 0 : 9.99;
  const total = subtotal + shipping + subtotal * 0.08;
  const currentStepIndex = steps.findIndex((s) => s.id === step);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      const profile = await getUserProfile(user.uid);
      setCustomer({
        name: profile?.displayName || user.displayName || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
      });
    };
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (payment === 'success') {
      clearCart();
      toast.success('¡Pago confirmado! Tu pedido fue registrado.');
      navigate('/', { replace: true });
    } else if (payment === 'cancelled') {
      toast.info('Pago cancelado, tu carrito sigue intacto.');
      navigate('/checkout', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (cart.length === 0 && !searchParams.get('payment')) {
      navigate('/cart', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const validateShipping = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para realizar un pedido');
      navigate('/login');
      return false;
    }
    if (!customer.name || !customer.phone || !customer.address) {
      toast.error('Por favor completa todos los campos de envío');
      return false;
    }

    const nameParts = customer.name.trim().split(/\s+/);
    if (nameParts.length < 2 || nameParts.some((p) => p.length < 2) || !/^[a-zA-ZÀ-ÿ\s]+$/.test(customer.name)) {
      toast.error('Ingresa tu nombre completo (nombre y apellido)');
      return false;
    }

    const phoneDigits = customer.phone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 13) {
      toast.error('Ingresa un número de teléfono válido');
      return false;
    }

    if (customer.address.trim().length < 10) {
      toast.error('Ingresa una dirección completa (calle, número, ciudad)');
      return false;
    }

    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return false;
    }
    return true;
  };

  const handleStripeCheckout = async () => {
    if (!validateShipping()) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
          customer,
          customerEmail: user!.email,
          userId: user!.uid,
        },
      });
      if (error || !data?.url) throw error || new Error('No se pudo iniciar el pago');
      window.location.href = data.url;
    } catch (error) {
      console.error('Error al iniciar pago con Stripe:', error);
      toast.error('No se pudo iniciar el pago');
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppCheckout = async () => {
    if (!validateShipping()) return;
    setIsSubmitting(true);
    try {
      await addOrder({ userId: user!.uid, customer, items: cart, total: getTotal() });
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10 max-w-md">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                  step === s.id
                    ? 'text-white'
                    : currentStepIndex > i
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-transparent border-white/20 text-muted-foreground'
                )}
                style={step === s.id ? { background: 'var(--site-primary)', borderColor: 'var(--site-primary)' } : undefined}
              >
                {currentStepIndex > i ? <Check size={14} /> : s.n}
              </div>
              <span className={cn('text-xs font-medium', step === s.id ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('flex-1 h-px mx-3 mb-5 min-w-[40px] sm:min-w-[80px]', currentStepIndex > i ? 'bg-green-500/40' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          <div className="bg-card border border-white/8 rounded-2xl p-6">
            {step === 'shipping' && (
              <div>
                <h2 className="font-semibold mb-6 flex items-center gap-2">
                  <MapPin size={16} style={{ color: 'var(--site-primary)' }} /> Dirección de Envío
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <InputField label="Nombre completo" placeholder="Tu nombre completo" value={customer.name} onChange={(v) => setCustomer({ ...customer, name: v })} />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Teléfono" placeholder="+1 (555) 123-4567" value={customer.phone} onChange={(v) => setCustomer({ ...customer, phone: v })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Dirección</label>
                    <textarea
                      placeholder="Calle, número, ciudad, código postal..."
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      rows={3}
                      className="w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[var(--site-primary)]/50 transition-colors resize-none"
                    />
                  </div>
                </div>
                <Btn
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full sm:w-auto"
                  onClick={() => {
                    if (validateShipping()) setStep('payment');
                  }}
                >
                  Continuar al pago <ArrowRight size={15} />
                </Btn>
              </div>
            )}

            {step === 'payment' && (
              <div>
                <h2 className="font-semibold mb-6 flex items-center gap-2">
                  <CreditCard size={16} style={{ color: 'var(--site-primary)' }} /> Método de Pago
                </h2>
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('stripe')}
                    className={cn(
                      'flex-1 py-3 rounded-xl border text-sm transition-colors flex items-center justify-center gap-2',
                      paymentMethod === 'stripe' ? 'border-[#635bff] text-[#635bff] bg-[#635bff]/5' : 'border-white/10 text-muted-foreground hover:border-white/20'
                    )}
                  >
                    <CreditCard size={15} /> Tarjeta (Stripe)
                  </button>
                  <button
                    onClick={() => setPaymentMethod('whatsapp')}
                    className={cn(
                      'flex-1 py-3 rounded-xl border text-sm transition-colors flex items-center justify-center gap-2',
                      paymentMethod === 'whatsapp' ? 'border-[#25D366] text-[#25D366] bg-[#25D366]/5' : 'border-white/10 text-muted-foreground hover:border-white/20'
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                  {paymentMethod === 'stripe'
                    ? 'Serás redirigido a Stripe Checkout para completar el pago de forma segura.'
                    : 'Tu pedido se coordinará directamente por WhatsApp.'}
                </div>

                <div className="flex gap-3">
                  <Btn variant="secondary" onClick={() => setStep('shipping')}>
                    <ChevronLeft size={15} /> Volver
                  </Btn>
                  <Btn
                    variant="primary"
                    size="lg"
                    onClick={paymentMethod === 'stripe' ? handleStripeCheckout : handleWhatsAppCheckout}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <>Finalizar pedido · ${total.toFixed(2)} <ArrowRight size={15} /></>}
                  </Btn>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-card border border-white/8 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Resumen del pedido</h3>
            <div className="space-y-3 mb-4">
              {cart.map((item) => {
                const hasImage = item.image && item.image !== 'https://via.placeholder.com/150';
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden',
                        !hasImage && `bg-gradient-to-br ${productGradient(item.id)}`
                      )}
                    >
                      {hasImage ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-lg">{item.icon || '📦'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      <p className="text-muted-foreground text-xs">Cant: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2 text-sm border-t border-white/8 pt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-foreground'}>{shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-white/8">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
