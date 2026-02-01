import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Store, Eye, EyeOff, LogOut } from 'lucide-react';
// Cambiamos @/ por rutas relativas para evitar errores de compilación
import { Button } from '../components/ui/button'; 
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
// Asegúrate de que esta ruta sea correcta según donde moviste la carpeta admin
import { AdminDashboard } from '../components/admin/AdminDashboard';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        toast.success('Bienvenido, Administrador 👋');
      } else {
        toast.error('Contraseña incorrecta');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    toast.info('Sesión cerrada');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <Lock className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Panel de Administrador
              </CardTitle>
              <CardDescription>
                Ingresa tu contraseña para acceder al panel de control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verificando...' : 'Acceder'}
                </Button>

                <Link to="/" className="block">
                  <Button type="button" className="w-full gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                    <Store className="h-4 w-4" />
                    Volver a la tienda
                  </Button>
                </Link>
              </form>

              <div className="mt-6 p-4 bg-slate-100 rounded-lg text-center">
                <p className="text-xs text-slate-500">
                  Contraseña: <code className="font-bold">admin123</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}