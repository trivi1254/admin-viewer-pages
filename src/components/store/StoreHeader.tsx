import { motion } from 'framer-motion';
import { ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

export function StoreHeader() {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15L35 30L10 45V15Z" fill="url(#gradHeader)" />
            <path d="M20 20L45 35L20 50V20Z" fill="#00d4aa" fillOpacity="0.7" />
            <path d="M18 28L26 33L18 38V28Z" fill="#00d4aa" />
            <defs>
              <linearGradient id="gradHeader" x1="10" y1="15" x2="35" y2="45" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1a3a5c" />
                <stop offset="1" stopColor="#00d4aa" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col">
            <span className="font-bold text-xl">
              <span className="text-[#1a3a5c]">Jorstan</span>{" "}
              <span className="text-[#00d4aa]">Click</span>
            </span>
            <span className="text-xs text-gray-500">El centro de tus compras rápidas</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#1a3a5c] transition-colors">Inicio</Link>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Contacto</a>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Categorías</a>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Nosotros</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" className="gap-2 border-[#1a3a5c] text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Cuenta</span>
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="outline" className="relative gap-2 border-[#00d4aa] text-[#1a3a5c] hover:bg-[#00d4aa] hover:text-white">
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Carrito</span>
              {itemCount > 0 && (
                <Badge
                  className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#00d4aa] text-white text-xs"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
