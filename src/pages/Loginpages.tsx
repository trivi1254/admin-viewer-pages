import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function Login() {
  const loginGoogle = () => {
    signInWithRedirect(auth, new GoogleAuthProvider());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="bg-background p-8 rounded-xl shadow w-[320px] text-center">
        <h1 className="text-2xl font-bold mb-2">URBAN-SHOP</h1>
        <p className="text-muted-foreground mb-6">
          Inicia sesión para continuar
        </p>

        <Button className="w-full" onClick={loginGoogle}>
          Continuar con Google
        </Button>
      </div>
    </div>
  );
}
