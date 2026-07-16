import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, authReady } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [isEmailProcessing, setIsEmailProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // If user is already logged in, redirect to profile
    if (!loading && user) {
      navigate('/profile');
    }
  }, [user, loading, navigate]);

  const loginGoogle = async () => {
    setIsGoogleProcessing(true);
    try {
      // Wait for auth persistence to be ready
      await authReady;

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        toast.success("¡Bienvenido!");
        navigate('/profile');
      }
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info("Inicio de sesión cancelado");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes.");
      } else {
        toast.error("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsEmailProcessing(true);
    try {
      // Wait for auth persistence to be ready
      await authReady;

      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      if (result.user) {
        toast.success("¡Bienvenido!");
        navigate('/profile');
      }
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No existe una cuenta con este correo");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Contraseña incorrecta");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Correo electrónico inválido");
      } else if (error.code === 'auth/invalid-credential') {
        toast.error("Credenciales inválidas. Verifica tu correo y contraseña.");
      } else {
        toast.error("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setIsEmailProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--site-primary)' }} />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Iniciar sesión</h1>
            <p className="text-muted-foreground mt-2">El centro de tus compras rápidas.</p>
          </div>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full py-6 text-base font-medium rounded-xl"
              onClick={loginGoogle}
              disabled={isGoogleProcessing || isEmailProcessing}
            >
              {isGoogleProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar con Google
                </>
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">o inicia sesión con correo</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="rounded-lg"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full text-white py-6 text-base font-medium rounded-xl hover:opacity-90"
                style={{ background: 'var(--site-primary)' }}
                disabled={isEmailProcessing || isGoogleProcessing}
              >
                {isEmailProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                ¿Aún no tienes cuenta?{" "}
                <Link to="/register" className="font-medium hover:underline" style={{ color: 'var(--site-primary)' }}>
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
