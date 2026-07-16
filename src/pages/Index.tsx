import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Truck,
  Shield,
  Award,
  Headphones,
  Mail,
  Phone,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useReviews } from '@/hooks/useReviews';
import { useSiteVisual } from '@/hooks/useSiteVisual';
import { ProductCard } from '@/components/store/ProductCard';
import { StarRating } from '@/components/store/StarRating';
import { Btn } from '@/components/store/Btn';

const TESTIMONIALS = [
  {
    name: 'Sara Méndez',
    role: 'Cliente frecuente',
    text: 'Excelente calidad y el envío llegó mucho más rápido de lo que esperaba. Sin duda vuelvo a comprar.',
    rating: 5,
  },
  {
    name: 'Carlos Andrade',
    role: 'Cliente verificado',
    text: 'La coordinación por WhatsApp fue súper fácil y el producto llegó exactamente como se veía en la foto.',
    rating: 5,
  },
  {
    name: 'Valentina Ríos',
    role: 'Cliente frecuente',
    text: 'Me encanta lo simple que es comprar aquí. Buen soporte y precios justos.',
    rating: 5,
  },
];

const SUPPORT_CHANNELS = [
  { icon: Mail, label: 'Correo', sub: 'johnmichaelloor@gmail.com', href: 'mailto:johnmichaelloor@gmail.com', accent: '#3B82F6' },
  { icon: MessageSquare, label: 'WhatsApp', sub: 'Escríbenos ahora', href: 'https://wa.me/593992378696', accent: '#10B981' },
  { icon: Phone, label: 'Teléfono', sub: '+593 992 378 696', href: 'tel:+593992378696', accent: '#F59E0B' },
];

const Index = () => {
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const { ratingsByProduct } = useReviews();
  const { visual } = useSiteVisual();
  const featured = products.slice(0, 4);

  return (
    <div className="bg-transparent">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-10">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'var(--site-glow)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, var(--site-glow) 0%, transparent 70%)' }}
          />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center py-16">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 border"
            style={{ background: 'color-mix(in srgb, var(--site-primary) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--site-primary) 30%, transparent)' }}
          >
            <Award size={13} style={{ color: 'var(--site-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--site-primary)' }}>
              Los mejores productos al mejor precio
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-none mb-6">
            Compras rápidas,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, var(--site-from), var(--site-to))' }}
            >
              sin complicaciones.
            </span>
          </h1>

          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            El centro de tus compras rápidas: productos de calidad, envíos rápidos y pago 100% seguro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/shop">
              <Btn size="lg" variant="primary">
                Explorar tienda <ArrowRight size={16} />
              </Btn>
            </Link>
            <Link to="/shop">
              <Btn size="lg" variant="secondary">
                Ver categorías
              </Btn>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            {[
              { icon: Truck, label: 'Envío rápido' },
              { icon: Shield, label: 'Pagos seguros' },
              { icon: Award, label: 'Productos verificados' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-muted-foreground">
                <Icon size={15} style={{ color: 'var(--site-primary)' }} />
                {label}
              </div>
            ))}
          </div>

          {visual.promoEnabled && visual.promoTitle && (
            <div className="mt-10 inline-flex items-center gap-4 bg-card/80 backdrop-blur-sm border border-amber-500/30 rounded-2xl px-6 py-4">
              <div className="text-3xl font-black text-amber-400 leading-none">{visual.promoDiscount}</div>
              <div className="border-l border-white/10 pl-4 text-left">
                <p className="font-semibold text-sm">{visual.promoTitle}</p>
                {visual.promoCode && (
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Usa el código <span className="font-mono text-amber-400 font-bold tracking-wide">{visual.promoCode}</span> al pagar
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--site-primary)' }}>
                Explorar por
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold">Categorías</h2>
            </div>
            <Link to="/shop">
              <Btn variant="ghost" size="sm">
                Ver todo <ChevronRight size={14} />
              </Btn>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.name).length;
              return (
                <Link
                  key={cat.id}
                  to="/shop"
                  className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-white/8 bg-card hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="text-4xl">{cat.icon || '🏷️'}</span>
                  <div className="text-center">
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-muted-foreground text-sm">{count} producto{count !== 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--site-primary)' }}>
              Selecciones top
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">Productos destacados</h2>
          </div>
          <Link to="/shop">
            <Btn variant="ghost" size="sm">
              Ver todo <ChevronRight size={14} />
            </Btn>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                rating={ratingsByProduct.get(p.id)?.rating}
                reviewCount={ratingsByProduct.get(p.id)?.count}
              />
            ))}
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Truck, title: 'Envío rápido', text: 'Envío gratis en pedidos mayores a $75. Llega en 2-5 días hábiles.' },
            { icon: Shield, title: 'Pagos seguros', text: 'Pagos procesados de forma segura con Stripe en cada transacción.' },
            { icon: Headphones, title: 'Soporte 24/7', text: 'Nuestro equipo está disponible para responder tus preguntas.' },
            { icon: Award, title: 'Productos verificados', text: 'Cada producto se revisa en calidad antes de publicarse.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card border border-white/8 rounded-2xl p-6 hover:border-white/16 transition-colors">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)' }}
              >
                <Icon size={20} style={{ color: 'var(--site-primary)' }} />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--site-primary)' }}>
            La confianza de miles
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold">Lo que dicen nuestros clientes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.name} className="bg-card border border-white/8 rounded-2xl p-6">
              <StarRating rating={testimonial.rating} />
              <p className="text-sm leading-relaxed mt-4 mb-6 text-muted-foreground">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
                >
                  {testimonial.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--site-primary)' }}>
            <Headphones size={12} /> Soporte
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">Estamos aquí para ayudarte</h2>
          <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
            Contáctanos por el canal que prefieras.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SUPPORT_CHANNELS.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group relative rounded-2xl border p-6 flex flex-col gap-3 hover:scale-[1.02] transition-all duration-200 bg-card"
              style={{ borderColor: `${ch.accent}30` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${ch.accent}22`, color: ch.accent }}
              >
                <ch.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-sm">{ch.label}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{ch.sub}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div
          className="relative rounded-3xl p-12 text-center overflow-hidden border"
          style={{
            borderColor: 'color-mix(in srgb, var(--site-primary) 30%, transparent)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--site-primary) 15%, transparent), color-mix(in srgb, var(--site-to) 10%, transparent))',
          }}
        >
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">¿Listo para comprar?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Explora nuestro catálogo completo de productos y encuentra lo que buscas.
            </p>
            <Link to="/shop">
              <Btn size="lg" variant="primary">
                Ir a la tienda <ArrowRight size={16} />
              </Btn>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
