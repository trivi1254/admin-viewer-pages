import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const CHANNELS = [
  { icon: Mail, label: 'Correo', value: 'johnmichaelloor@gmail.com', href: 'mailto:johnmichaelloor@gmail.com' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+593 992 378 696', href: 'https://wa.me/593992378696' },
  { icon: Phone, label: 'Teléfono', value: '+593 992 378 696', href: 'tel:+593992378696' },
];

export default function Support() {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-4 text-center">Estamos aquí para ayudarte</h1>
      <p className="text-muted-foreground text-center mb-12">
        Contáctanos por el canal que prefieras. Tiempo de respuesta promedio: menos de 2 horas.
      </p>

      <div className="grid sm:grid-cols-3 gap-6 mb-12">
        {CHANNELS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-xl border border-border bg-card text-center hover:border-[var(--site-primary)] transition-colors"
          >
            <c.icon className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--site-primary)' }} />
            <h3 className="font-semibold mb-1">{c.label}</h3>
            <p className="text-sm text-muted-foreground">{c.value}</p>
          </a>
        ))}
      </div>

      <div className="p-6 rounded-xl border border-border bg-card flex items-center gap-4">
        <MapPin className="h-6 w-6 shrink-0" style={{ color: 'var(--site-primary)' }} />
        <div>
          <h3 className="font-semibold">Ubicación</h3>
          <p className="text-sm text-muted-foreground">Guayaquil y Quito, Ecuador — Lunes a Viernes 9:00-18:00, Sábado 9:00-14:00</p>
        </div>
      </div>
    </div>
  );
}
