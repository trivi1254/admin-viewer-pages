import { Mail, Phone, MapPin } from 'lucide-react';

export function StoreFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 15L35 30L10 45V15Z" fill="url(#gradFooter)" />
                <path d="M20 20L45 35L20 50V20Z" fill="#00d4aa" fillOpacity="0.7" />
                <path d="M18 28L26 33L18 38V28Z" fill="#00d4aa" />
                <defs>
                  <linearGradient id="gradFooter" x1="10" y1="15" x2="35" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1a3a5c" />
                    <stop offset="1" stopColor="#00d4aa" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-bold">
                <span className="text-[#1a3a5c]">Jorstan</span>{" "}
                <span className="text-[#00d4aa]">Click</span>
              </span>
            </div>
            <p className="text-sm text-gray-500">
              El centro de tus compras rápidas con los mejores productos y precios del mercado.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#1a3a5c]">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#00d4aa]" />
                <span>+593 999 999 999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#00d4aa]" />
                <span>contacto@jorstanclick.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#00d4aa]" />
                <span>Quito, Ecuador</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#1a3a5c]">Horario</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>Lunes - Viernes: 9:00 - 18:00</p>
              <p>Sábado: 9:00 - 14:00</p>
              <p>Domingo: Cerrado</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 Jorstan Click. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
