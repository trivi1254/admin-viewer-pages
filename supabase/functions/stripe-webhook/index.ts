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
const resendApiKey = Deno.env.get('RESEND_API_KEY');

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const BRAND_PRIMARY = '#3B82F6';
const BRAND_DARK = '#0F172A';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function buildOrderEmailHtml(order: {
  customerName: string;
  customerAddress: string;
  items: { name: string; price: number; quantity: number }[];
  total: number;
}) {
  const itemRows = order.items
    .map(
      (i, idx) => `
        <tr style="background:${idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF'}">
          <td style="padding:12px 16px;font-size:14px;color:#0F172A;border-bottom:1px solid #E2E8F0">
            ${escapeHtml(i.name)}
            <span style="color:#94A3B8;font-size:13px"> &times;${i.quantity}</span>
          </td>
          <td style="padding:12px 16px;font-size:14px;color:#0F172A;text-align:right;border-bottom:1px solid #E2E8F0;white-space:nowrap">
            $${(i.price * i.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF2F7;padding:32px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(15,23,42,0.06)">
          <tr>
            <td style="background:${BRAND_DARK};padding:28px 32px;text-align:center">
              <span style="font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em">
                Jorstan<span style="color:${BRAND_PRIMARY}">Click</span>
              </span>
              <div style="color:#94A3B8;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-top:4px">
                Compras Rápidas
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px">
                <tr>
                  <td style="width:48px;height:48px;border-radius:50%;background:#DBEAFE;text-align:center;vertical-align:middle;font-size:22px">
                    ✅
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px;font-size:20px;color:#0F172A;text-align:center">¡Gracias por tu compra, ${escapeHtml(order.customerName)}!</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;text-align:center;line-height:1.5">
                Tu pago fue confirmado y tu pedido ya está siendo procesado.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden">
                ${itemRows}
                <tr>
                  <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#0F172A;background:#F1F5F9">Total</td>
                  <td style="padding:14px 16px;font-size:16px;font-weight:700;color:${BRAND_PRIMARY};text-align:right;background:#F1F5F9">$${order.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 0">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:12px">
                <tr>
                  <td style="padding:16px">
                    <div style="font-size:11px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Dirección de envío</div>
                    <div style="font-size:14px;color:#334155;line-height:1.5">${escapeHtml(order.customerAddress)}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 32px;text-align:center">
              <p style="margin:0;font-size:12px;color:#94A3B8;line-height:1.6">
                ¿Alguna pregunta? Responde directamente a este correo.<br />
                +593 992 378 696 · Guayaquil y Quito, Ecuador
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

async function sendOrderConfirmationEmail(
  to: string,
  order: { customerName: string; customerAddress: string; items: { name: string; price: number; quantity: number }[]; total: number }
) {
  if (!resendApiKey || !to) return;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'JorstanClick <pedidos@jorstanclick.johnloor.com>',
      reply_to: 'johnmichaelloor@gmail.com',
      to,
      subject: '¡Gracias por tu compra en JorstanClick!',
      html: buildOrderEmailHtml(order),
    }),
  });

  if (!res.ok) {
    console.error('Error al enviar correo de confirmación:', await res.text());
  }
}

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

      const customerEmail = metadata.customerEmail || session.customer_details?.email || '';

      await supabaseAdmin.from('orders').insert({
        user_id: metadata.userId || null,
        customer_name: metadata.customerName,
        customer_phone: metadata.customerPhone,
        customer_address: metadata.customerAddress,
        customer_email: customerEmail || null,
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

      await sendOrderConfirmationEmail(customerEmail, {
        customerName: metadata.customerName,
        customerAddress: metadata.customerAddress,
        items: orderItems,
        total,
      });
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
