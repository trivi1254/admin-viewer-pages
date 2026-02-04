import { motion } from 'framer-motion';
import { Clock, Shield, Globe, Star } from 'lucide-react';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#f5f7fa]">
      {/* Geometric background pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="1" fill="#cbd5e0" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      <div className="absolute inset-0">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
          <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="#cbd5e0" strokeWidth="1" />
          <line x1="30%" y1="40%" x2="50%" y2="25%" stroke="#cbd5e0" strokeWidth="1" />
          <line x1="50%" y1="25%" x2="70%" y2="45%" stroke="#cbd5e0" strokeWidth="1" />
          <line x1="70%" y1="45%" x2="90%" y2="30%" stroke="#cbd5e0" strokeWidth="1" />
          <line x1="20%" y1="60%" x2="40%" y2="80%" stroke="#cbd5e0" strokeWidth="1" />
          <line x1="40%" y1="80%" x2="60%" y2="65%" stroke="#cbd5e0" strokeWidth="1" />
          <line x1="60%" y1="65%" x2="80%" y2="85%" stroke="#cbd5e0" strokeWidth="1" />
        </svg>
      </div>

      <div className="container relative py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a3a5c]/10 text-[#1a3a5c] mb-6"
          >
            <Star className="h-4 w-4 fill-[#00d4aa] text-[#00d4aa]" />
            <span className="text-sm font-medium">Los mejores productos al mejor precio</span>
          </motion.div>

          {/* Logo and Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <svg width="80" height="80" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 15L35 30L10 45V15Z" fill="url(#gradHero)" />
              <path d="M20 20L45 35L20 50V20Z" fill="#00d4aa" fillOpacity="0.7" />
              <path d="M18 28L26 33L18 38V28Z" fill="#00d4aa" />
              <defs>
                <linearGradient id="gradHero" x1="10" y1="15" x2="35" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1a3a5c" />
                  <stop offset="1" stopColor="#00d4aa" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-[#1a3a5c]">Jorstan</span>{" "}
              <span className="text-[#00d4aa]">Click</span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            El centro de tus compras rápidas.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center">
                <Clock className="h-6 w-6 text-[#1a3a5c]" />
              </div>
              <p className="font-semibold text-sm text-gray-700">Entrega Rápida</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#1a3a5c]" />
              </div>
              <p className="font-semibold text-sm text-gray-700">Pago Seguro</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center">
                <Globe className="h-6 w-6 text-[#1a3a5c]" />
              </div>
              <p className="font-semibold text-sm text-gray-700">Todo en un Click</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
