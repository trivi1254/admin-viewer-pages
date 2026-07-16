export default function Cookies() {
  return (
    <div className="container py-16 max-w-3xl prose-sm">
      <h1 className="text-4xl font-bold mb-8">Política de Cookies</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu navegador para recordar
            tus preferencias y mejorar tu experiencia de compra.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">¿Qué cookies usamos?</h2>
          <p>
            Usamos cookies esenciales para el funcionamiento del carrito de compras y la sesión de
            usuario, así como para recordar tu preferencia de tema visual e idioma.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">Control de cookies</h2>
          <p>
            Puedes aceptar o rechazar las cookies no esenciales desde el banner que aparece en tu primera
            visita, o eliminarlas en cualquier momento desde la configuración de tu navegador.
          </p>
        </section>
      </div>
    </div>
  );
}
