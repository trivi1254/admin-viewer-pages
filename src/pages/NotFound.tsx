import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página no encontrada</p>
        <Link to="/" className="underline hover:opacity-90" style={{ color: 'var(--site-primary)' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
