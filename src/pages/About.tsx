import { MousePointerClick, Truck, Shield, Award } from 'lucide-react';

export default function About() {
  return (
    <div className="container py-16 max-w-4xl">
      <div className="text-center mb-12">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
        >
          <MousePointerClick className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Sobre <span style={{ color: 'var(--site-primary)' }}>JorstanClick</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Somos una tienda en línea enfocada en ofrecer productos de calidad, con envíos rápidos y
          atención cercana a cada cliente. El centro de tus compras rápidas.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <Truck className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--site-primary)' }} />
          <h3 className="font-semibold mb-2">Entrega Rápida</h3>
          <p className="text-sm text-muted-foreground">Procesamos y enviamos tus pedidos lo más pronto posible.</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <Shield className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--site-primary)' }} />
          <h3 className="font-semibold mb-2">Pago Seguro</h3>
          <p className="text-sm text-muted-foreground">Tarjeta vía Stripe o coordinación directa por WhatsApp.</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card text-center">
          <Award className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--site-primary)' }} />
          <h3 className="font-semibold mb-2">Calidad Verificada</h3>
          <p className="text-sm text-muted-foreground">Cada producto es revisado antes de publicarse en la tienda.</p>
        </div>
      </div>
    </div>
  );
}
