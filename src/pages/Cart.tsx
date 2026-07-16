import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Truck, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Btn } from '@/components/store/Btn';
import { productGradient } from '@/lib/productGradient';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();
  const navigate = useNavigate();

  const subtotal = getTotal();
  const shipping = subtotal > 75 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleContinue = () => {
    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={56} className="text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">Agrega algo de la tienda para empezar.</p>
          <Link to="/shop">
            <Btn variant="primary">Ver productos</Btn>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito ({cart.length})</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {cart.map((item) => {
            const hasImage = item.image && item.image !== 'https://via.placeholder.com/150';
            return (
              <div key={item.id} className="flex gap-4 bg-card border border-white/8 rounded-2xl p-5">
                <div
                  className={cn(
                    'w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden',
                    !hasImage && `bg-gradient-to-br ${productGradient(item.id)}`
                  )}
                >
                  {hasImage ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : item.icon ? (
                    <span className="text-3xl">{item.icon}</span>
                  ) : (
                    <Package className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-red-400 transition-colors ml-3">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 bg-background rounded-lg border border-white/8 p-0.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-md hover:bg-white/8 flex items-center justify-center text-muted-foreground transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-md hover:bg-white/8 flex items-center justify-center text-muted-foreground transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-card border border-white/8 rounded-2xl p-6 sticky top-24">
            <h3 className="font-semibold mb-5">Resumen del pedido</h3>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envío</span>
                <span className={shipping === 0 ? 'text-green-400' : 'text-foreground'}>
                  {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Impuesto (8%)</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold py-4 border-t border-white/8 mb-5">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {shipping > 0 && (
              <div
                className="flex items-center gap-2 rounded-xl p-3 mb-4 border"
                style={{ background: 'color-mix(in srgb, var(--site-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--site-primary) 20%, transparent)' }}
              >
                <Truck size={13} style={{ color: 'var(--site-primary)' }} className="flex-shrink-0" />
                <p className="text-xs" style={{ color: 'var(--site-primary)' }}>
                  Agrega ${(75 - subtotal).toFixed(2)} más para envío gratis
                </p>
              </div>
            )}
            <Btn variant="primary" size="lg" className="w-full" onClick={handleContinue}>
              Continuar a Checkout <ArrowRight size={15} />
            </Btn>
            <Link to="/shop" className="block w-full text-center text-muted-foreground text-sm hover:text-foreground transition-colors mt-3 py-2">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
