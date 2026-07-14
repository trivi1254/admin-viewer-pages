# Guía de configuración: Supabase + Stripe

## 0. Aviso sobre tu `.env` actual
Tu archivo `.env` en el repo no tiene variables reales — tiene pegado por error
el contenido del bloque `firebaseConfig` de `src/lib/firebase.ts` en vez de
`VITE_FIREBASE_API_KEY=xxxx`. Eso significa que el login con Firebase
probablemente no está leyendo tus credenciales reales ahora mismo. Cuando
armes tu `.env` nuevo (paso 4) corrígelo también.

## 1. Aplicar estos archivos a tu proyecto local
Descomprime `supabase-stripe-cambios.zip` y copia el contenido de
`paquete-cambios/` sobre tu repo local (mismo árbol de carpetas, va a
sobrescribir los archivos modificados y agregar los nuevos). También puedes
usar `cambios.diff` con `git apply cambios.diff` si prefieres revisar el
diff primero.

```bash
npm install   # instala @supabase/supabase-js (ya está en package.json)
```

## 2. Crear el proyecto en Supabase
1. Ve a https://supabase.com -> New Project.
2. Región recomendada para Ecuador: `us-east-1` (o la más cercana disponible).
3. Cuando esté listo: Project Settings -> API -> copia:
   - `Project URL` -> va en `VITE_SUPABASE_URL`
   - `anon public` key -> va en `VITE_SUPABASE_ANON_KEY`
   - `service_role` key -> **NO va en tu `.env` del frontend**, se usa solo
     en el paso 5 como secret de Supabase.

## 3. Crear las tablas
Dashboard de Supabase -> SQL Editor -> New query -> pega el contenido de
`supabase/schema.sql` -> Run.

## 4. Armar tu `.env` real
Copia `.env.example` como `.env` y completa:
- Tus 6 variables `VITE_FIREBASE_*` reales (las de tu proyecto Firebase).
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` del paso 2.
- `VITE_STRIPE_PUBLISHABLE_KEY` (Stripe Dashboard -> Developers -> API keys,
  modo Test primero — empieza con `pk_test_`).

## 5. Instalar el CLI de Supabase y desplegar las Edge Functions
```bash
npm install -g supabase
supabase login
supabase link --project-ref <tu-project-ref>   # está en la URL del dashboard

# Secrets del lado servidor (NUNCA en el .env del frontend):
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx   # lo obtienes en el paso 6
supabase secrets set SITE_URL=http://localhost:5173      # o tu dominio en producción

supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```
El flag `--no-verify-jwt` en el webhook es necesario porque Stripe llama a
esa función directamente (sin token de Supabase), y en su lugar verificamos
la firma propia de Stripe dentro del código.

## 6. Configurar el webhook en Stripe
1. Stripe Dashboard -> Developers -> Webhooks -> Add endpoint.
2. URL: `https://<tu-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Evento a escuchar: `checkout.session.completed`
4. Copia el "Signing secret" (`whsec_...`) y guárdalo con
   `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx` (paso 5).

## 7. Probar
- Modo test de Stripe: usa la tarjeta `4242 4242 4242 4242`, cualquier fecha
  futura y CVC.
- `npm run dev`, agrega productos al carrito, checkout con tarjeta.
- Verifica en Supabase Table Editor -> `orders` que se creó la fila con
  `payment_status = paid`.

## Cosas para la siguiente fase (logins)
- La tabla `admins` y las policies de `products`/`orders` para
  escritura están marcadas como **temporales** en `schema.sql` (comentario
  `TODO fase 2`). Cuando migremos el login de Firebase a Supabase Auth,
  cerramos ese hueco reemplazando esas policies por unas que exijan
  `auth.uid()` + rol admin real.
- La tabla `payment_methods` (tarjetas guardadas como texto) puede
  reemplazarse por el objeto `Customer` + `Payment Methods` de Stripe, que
  guarda tarjetas de forma segura de verdad. Te lo dejo como mejora sugerida,
  no lo toqué todavía para no ampliar el alcance de hoy.

## Extra: limpieza de firebase.ts
`src/lib/firebase.ts` incluido en este paquete quedó recortado — solo tiene
lo del login (Auth). Todo lo de Firestore que ya nadie usa se quitó.
Simplemente sobrescribe tu archivo actual con este.
