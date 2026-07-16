import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, MousePointerClick } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
              >
                <MousePointerClick size={16} className="text-white" />
              </div>
              <span className="text-xl font-bold">
                Jorstan<span style={{ color: 'var(--site-primary)' }}>Click</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              El centro de tus compras rápidas con los mejores productos y precios del mercado.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: 'var(--site-primary)' }} />
                <span>+593 992 378 696</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: 'var(--site-primary)' }} />
                <span>johnmichaelloor@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: 'var(--site-primary)' }} />
                <span>Guayaquil y Quito, Ecuador</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Horario</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Lunes - Viernes: 9:00 - 18:00</p>
              <p>Sábado: 9:00 - 14:00</p>
              <p>Domingo: Cerrado</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                Nosotros
              </Link>
              <Link to="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                Soporte
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link to="/cookies" className="block text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 JorstanClick. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
