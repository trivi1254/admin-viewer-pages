export default function Terms() {
  return (
    <div className="container py-16 max-w-3xl prose-sm">
      <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">1. Aceptación de los términos</h2>
          <p>
            Al acceder y usar JorstanClick aceptas estos términos y condiciones en su totalidad. Si no
            estás de acuerdo, por favor no utilices este sitio.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">2. Pedidos y pagos</h2>
          <p>
            Los pedidos pueden pagarse mediante tarjeta (procesado de forma segura por Stripe) o
            coordinarse directamente vía WhatsApp. Los precios están sujetos a cambios sin previo aviso.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">3. Envíos</h2>
          <p>
            Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad del
            producto.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">4. Cuentas de usuario</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu cuenta y de toda actividad que ocurra
            bajo la misma.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">5. Contacto</h2>
          <p>Para preguntas sobre estos términos, escríbenos a johnmichaelloor@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}
