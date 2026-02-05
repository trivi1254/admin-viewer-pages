import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Store, LogOut, Loader2, ShieldAlert } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { useAuth } from '../contexts/AuthContext';
import { auth, authReady, checkIsAdmin, setAdminUser } from '../lib/firebase';

// Lista de correos autorizados como administradores
const ADMIN_EMAILS = [
  'jorstanclick@gmail.com',
  // Agrega aqui mas correos de administradores autorizados
];

export default function AdminPage() {
  const { user, loading, isAdmin, adminLoading, logout } = useAuth();
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  const loginWithGoogle = async () => {
    setIsGoogleProcessing(true);
    try {
      await authReady;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        setCheckingAdmin(true);

        // Verificar si el correo esta en la lista de administradores
        const userEmail = result.user.email?.toLowerCase();
        const isAuthorizedEmail = ADMIN_EMAILS.some(
          email => email.toLowerCase() === userEmail
        );

        if (isAuthorizedEmail) {
          // Verificar si ya existe en Firestore, si no, crearlo
          const isAlreadyAdmin = await checkIsAdmin(result.user.uid);
          if (!isAlreadyAdmin) {
            await setAdminUser(result.user.uid, result.user.email || '');
          }
          toast.success('Bienvenido, Administrador');
        } else {
          // No es un correo autorizado
          toast.error('Este correo no tiene permisos de administrador');
          await logout();
        }
        setCheckingAdmin(false);
      }
    } catch (error: any) {
      console.error('Error en autenticacion:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info('Inicio de sesion cancelado');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('El navegador bloqueo la ventana emergente. Por favor, permite las ventanas emergentes.');
      } else {
        toast.error('Error al iniciar sesion. Intenta de nuevo.');
      }
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Sesion cerrada');
  };

  // Mostrar pantalla de carga mientras se verifica la autenticacion
  if (loading || adminLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {checkingAdmin ? 'Verificando permisos...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  // Si el usuario esta autenticado pero no es admin
  if (user && !isAdmin) {
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
                <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Acceso Denegado
              </CardTitle>
              <CardDescription>
                Tu cuenta ({user.email}) no tiene permisos de administrador.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleLogout}
                className="w-full gap-2"
                variant="outline"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesion
              </Button>

              <Link to="/" className="block">
                <Button type="button" className="w-full gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                  <Store className="h-4 w-4" />
                  Volver a la tienda
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Si no esta autenticado, mostrar login con Google
  if (!user) {
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
                Inicia sesion con tu cuenta de Google autorizada para acceder al panel de control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={loginWithGoogle}
                className="w-full gap-2"
                disabled={isGoogleProcessing}
              >
                {isGoogleProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Iniciar sesion con Google
                  </>
                )}
              </Button>

              <Link to="/" className="block">
                <Button type="button" className="w-full gap-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                  <Store className="h-4 w-4" />
                  Volver a la tienda
                </Button>
              </Link>

              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">
                  Solo los correos autorizados pueden acceder al panel de administrador.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Usuario autenticado y es admin - mostrar dashboard
  return <AdminDashboard onLogout={handleLogout} />;
}
