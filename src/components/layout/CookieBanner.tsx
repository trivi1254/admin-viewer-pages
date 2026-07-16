import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur"
        >
          <div className="container py-4 flex flex-col sm:flex-row items-center gap-4">
            <Cookie className="h-6 w-6 shrink-0" style={{ color: 'var(--site-primary)' }} />
            <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
              Usamos cookies para mejorar tu experiencia. Al continuar navegando aceptas nuestra{' '}
              <Link to="/cookies" className="underline" style={{ color: 'var(--site-primary)' }}>
                política de cookies
              </Link>
              .
            </p>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={decline}>
                Rechazar
              </Button>
              <Button
                size="sm"
                className="text-white hover:opacity-90"
                style={{ background: 'var(--site-primary)' }}
                onClick={accept}
              >
                Aceptar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
