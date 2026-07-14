// Supabase Edge Function: create-checkout-session
// Recibe: { items: [{id, quantity}], customer: {name, phone, address}, userId? }
// Devuelve: { url: string } -> el frontend redirige a esa URL de Stripe Checkout.
//
// IMPORTANTE: el precio de cada item se vuelve a leer de la base de datos
// aquí, en el servidor. Nunca se confía en el precio que manda el navegador.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@17?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customer, userId } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Carrito vacío' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!customer?.name || !customer?.phone || !customer?.address) {
      return new Response(JSON.stringify({ error: 'Faltan datos del cliente' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Traer los precios REALES desde la base de datos (nunca del cliente)
    const productIds = items.map((i: { id: string }) => i.id);
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, price, image')
      .in('id', productIds);

    if (error || !products) throw new Error('No se pudieron leer los productos');

    const lineItems = items.map((item: { id: string; quantity: number }) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) throw new Error(`Producto no encontrado: ${item.id}`);

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : undefined,
          },
          unit_amount: Math.round(Number(product.price) * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      };
    });

    const origin = req.headers.get('origin') ?? Deno.env.get('SITE_URL') ?? '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/cart?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?payment=cancelled`,
      metadata: {
        userId: userId ?? '',
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        // Guardamos id + cantidad; el webhook vuelve a leer precios de la DB.
        items: JSON.stringify(items),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
