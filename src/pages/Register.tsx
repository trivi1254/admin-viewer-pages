import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, authReady } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Shield, Globe, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Register() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
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
        toast.success("¡Cuenta creada exitosamente!");
        navigate('/profile');
      }
    } catch (error: any) {
      console.error("Error en autenticación:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.info("Registro cancelado");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes.");
      } else {
        toast.error("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setIsGoogleProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      // Wait for auth persistence to be ready
      await authReady;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      if (formData.name) {
        await updateProfile(userCredential.user, {
          displayName: formData.name
        });
      }

      toast.success("¡Cuenta creada exitosamente!");
      navigate('/profile');
    } catch (error: any) {
      console.error("Error al registrar:", error);

      if (error.code === 'auth/email-already-in-use') {
        toast.error("Este correo ya está registrado. Intenta iniciar sesión.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Correo electrónico inválido");
      } else if (error.code === 'auth/weak-password') {
        toast.error("La contraseña es muy débil");
      } else {
        toast.error("Error al crear la cuenta. Intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00d4aa] mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      {/* Header */}
      <header className="w-full py-4 px-6 flex items-center justify-between bg-white shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 15L35 30L10 45V15Z" fill="url(#grad1)" />
              <path d="M20 20L45 35L20 50V20Z" fill="#00d4aa" fillOpacity="0.7" />
              <path d="M18 28L26 33L18 38V28Z" fill="#00d4aa" />
              <defs>
                <linearGradient id="grad1" x1="10" y1="15" x2="35" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1a3a5c" />
                  <stop offset="1" stopColor="#00d4aa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">
              <span className="text-[#1a3a5c]">Jorstan</span>{" "}
              <span className="text-[#00d4aa]">Click</span>
            </span>
            <span className="text-[10px] text-gray-500">El centro de tus compras rápidas.</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#1a3a5c] transition-colors">Inicio</Link>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Contacto</a>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Categorías</a>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Nosotros</a>
          <span className="text-[#00d4aa] font-medium border-b-2 border-[#00d4aa] pb-1">Registro</span>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Register Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <svg width="50" height="50" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 15L35 30L10 45V15Z" fill="url(#grad2)" />
                <path d="M20 20L45 35L20 50V20Z" fill="#00d4aa" fillOpacity="0.7" />
                <path d="M18 28L26 33L18 38V28Z" fill="#00d4aa" />
                <defs>
                  <linearGradient id="grad2" x1="10" y1="15" x2="35" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1a3a5c" />
                    <stop offset="1" stopColor="#00d4aa" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="text-[#1a3a5c]">Crear</span>{" "}
                  <span className="text-[#00d4aa]">Cuenta</span>
                </h1>
              </div>
            </div>

            <p className="text-center text-gray-500 mb-6">
              Regístrate para empezar a comprar
            </p>

            {/* Register Form */}
            <form onSubmit={handleEmailRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm text-gray-600">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="rounded-lg border-gray-200 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-600">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-lg border-gray-200 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-600">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="rounded-lg border-gray-200 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-600">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="rounded-lg border-gray-200 focus:border-[#00d4aa] focus:ring-[#00d4aa]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00d4aa] hover:bg-[#00b894] text-white py-6 text-base font-medium rounded-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">o registrarse con</span>
              </div>
            </div>

            <Button
              className="w-full bg-[#1a3a5c] hover:bg-[#142d47] text-white py-6 text-base font-medium rounded-xl transition-all duration-200"
              onClick={loginGoogle}
              disabled={isGoogleProcessing}
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
                  Google
                </>
              )}
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-[#00d4aa] hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-[#1a3a5c]" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Entrega Rápida</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-[#1a3a5c]" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Pago Seguro</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-[#1a3a5c] flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-[#1a3a5c]" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Todo en un Click</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 bg-[#2d3748]">
        <p>© 2026 Jorstan Click. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
