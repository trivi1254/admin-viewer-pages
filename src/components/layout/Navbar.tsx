import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, User, LogOut, Menu, X, MousePointerClick, Palette } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteTheme, SITE_THEMES } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Inicio', to: '/' },
  { label: 'Tienda', to: '/shop' },
  { label: 'Cuenta', to: '/account' },
];

export function Navbar() {
  const { getItemCount } = useCart();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useSiteTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const itemCount = getItemCount();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-background/95 backdrop-blur-md border-b border-white/8 shadow-xl shadow-black/20' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))', boxShadow: '0 4px 14px var(--site-glow)' }}
          >
            <MousePointerClick size={16} className="text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-lg tracking-tight">
              Jorstan<span style={{ color: 'var(--site-primary)' }}>Click</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-muted-foreground tracking-wide">
              Compras Rápidas
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const isActive = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive ? 'text-foreground bg-white/8' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block" ref={themeRef}>
            <button
              onClick={() => setThemeOpen((o) => !o)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              title="Cambiar tema de color"
            >
              <Palette size={16} className="text-muted-foreground" />
            </button>
            {themeOpen && (
              <div className="absolute right-0 top-full mt-2 bg-[#1E293B] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-1.5 min-w-[140px]">
                <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider px-1 mb-1">Tema</p>
                {SITE_THEMES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setTheme(t);
                      setThemeOpen(false);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-colors w-full text-left',
                      theme.name === t.name ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                  >
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: t.primary }} />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link to="/cart" className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ShoppingCart size={16} className="text-muted-foreground" />
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'var(--site-primary)' }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/account"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors overflow-hidden"
                title={user.displayName || user.email || 'Cuenta'}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Usuario'} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-muted-foreground" />
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={16} className="text-red-400" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 items-center justify-center transition-colors"
              title="Cuenta"
            >
              <User size={16} className="text-muted-foreground" />
            </Link>
          )}

          <button
            className="md:hidden w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={16} className="text-foreground" /> : <Menu size={16} className="text-muted-foreground" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-t border-white/8 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((l) => {
            const isActive = l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors',
                  isActive ? 'text-foreground bg-white/8' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </motion.header>
  );
}
