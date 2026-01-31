import { Store, Mail, Phone, MapPin } from 'lucide-react';

export function StoreFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">Urban Shop</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu tienda de confianza con los mejores productos y precios del mercado.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+593 999 999 999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contacto@urbanshop.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Quito, Ecuador</span>
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
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Urban Shop. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
