import { motion } from 'framer-motion';
import { ShoppingBag, Star, Truck, Shield } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      <div className="container relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
          >
            <Star className="h-4 w-4 fill-primary" />
            <span className="text-sm font-medium">Los mejores productos al mejor precio</span>
          </motion.div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Bienvenido a </span>
            <span className="text-gradient">Urban Shop</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Descubre nuestra colección exclusiva de productos seleccionados especialmente para ti. 
            Calidad garantizada y envío rápido.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="p-2 rounded-lg gradient-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Envío Rápido</p>
                <p className="text-xs text-muted-foreground">En tu puerta</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="p-2 rounded-lg gradient-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Pago Seguro</p>
                <p className="text-xs text-muted-foreground">100% protegido</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-sm">
              <div className="p-2 rounded-lg gradient-primary">
                <ShoppingBag className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Calidad Premium</p>
                <p className="text-xs text-muted-foreground">Garantizado</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
