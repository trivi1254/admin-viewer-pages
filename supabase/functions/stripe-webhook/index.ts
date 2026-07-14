// Supabase Edge Function: stripe-webhook
// Configurar en el Dashboard de Stripe -> Developers -> Webhooks:
//   URL: https://<tu-proyecto>.supabase.co/functions/v1/stripe-webhook
//   Evento a escuchar: checkout.session.completed
//
// Esta función verifica la firma del webhook (evita pagos falsos) y,
// solo si el pago fue confirmado por Stripe, crea el pedido en la tabla
// `orders` usando la service_role key (bypassa RLS, no la expongas nunca
// al frontend).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@17?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, webhookSecret);
  } catch (err) {
    console.error('Firma de webhook inválida:', (err as Error).message);
    return new Response('Firma inválida', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Evitar duplicados si Stripe reintenta la entrega del evento
    const { data: existing } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('stripe_checkout_session_id', session.id)
      .maybeSingle();

    if (!existing) {
      const metadata = session.metadata ?? {};
      const items = JSON.parse(metadata.items ?? '[]');

      // Volvemos a leer precios reales para armar el detalle guardado
      const productIds = items.map((i: { id: string }) => i.id);
      const { data: products } = await supabaseAdmin
        .from('products')
        .select('id, name, price, image, icon')
        .in('id', productIds);

      const orderItems = items.map((item: { id: string; quantity: number }) => {
        const product = products?.find((p) => p.id === item.id);
        return {
          id: item.id,
          name: product?.name ?? 'Producto',
          image: product?.image,
          icon: product?.icon,
          price: Number(product?.price ?? 0),
          quantity: item.quantity,
        };
      });

      const total = (session.amount_total ?? 0) / 100;

      await supabaseAdmin.from('orders').insert({
        user_id: metadata.userId || null,
        customer_name: metadata.customerName,
        customer_phone: metadata.customerPhone,
        customer_address: metadata.customerAddress,
        items: orderItems,
        total,
        status: 'pending',
        payment_provider: 'stripe',
        payment_status: 'paid',
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status_history: [
          { status: 'pending', message: 'Pago confirmado con Stripe', date: new Date().toISOString() },
        ],
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
