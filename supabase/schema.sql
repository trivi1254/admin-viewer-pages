-- =====================================================================
-- Esquema Supabase para ITNetworks Store
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- PRODUCTOS
-- ---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  image text,
  icon text,
  description text,
  category text,
  payment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_created_at on products (created_at desc);

alter table products enable row level security;

-- Lectura pública (catálogo visible para todos, con o sin login)
create policy "products_public_read"
  on products for select
  using (true);

-- Escritura: por ahora vía anon key desde el panel /admin.
-- NOTA DE SEGURIDAD: esto es temporal. Hoy el panel /admin solo está
-- protegido en el cliente (igual que dependía de custom claims revisados
-- en el cliente con Firebase). Cuando migremos el login a Supabase Auth
-- (fase 2), esta policy se reemplaza por una que exija auth.uid() + rol
-- admin real, usando la tabla `admins` de abajo. Queda marcado como TODO.
create policy "products_temp_write"
  on products for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- PEDIDOS (tabla única — reemplaza la duplicación orders + users/{uid}/orders)
-- ---------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id text, -- Firebase UID por ahora; se migra a uuid (auth.users) en fase 2
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  items jsonb not null,               -- OrderItem[]
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending','processing','shipped','delivered','cancelled')),
  payment_provider text not null default 'whatsapp'
    check (payment_provider in ('stripe','whatsapp')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid','paid','refunded','failed')),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on orders (user_id);
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_orders_stripe_session on orders (stripe_checkout_session_id);

alter table orders enable row level security;

-- Un usuario solo puede leer sus propios pedidos (user_id = su Firebase UID,
-- enviado como header custom hasta que migremos a Supabase Auth).
-- Por ahora, dado que no hay Supabase Auth todavía, dejamos lectura abierta
-- vía anon key igual que products_temp_write (mismo TODO de fase 2).
create policy "orders_temp_read"
  on orders for select
  using (true);

-- Pedidos pagados con Stripe: SOLO los crea el webhook (service_role),
-- nunca el cliente. Pedidos por WhatsApp (sin pago online) sí los puede
-- crear el cliente directamente.
create policy "orders_whatsapp_insert"
  on orders for insert
  with check (payment_provider = 'whatsapp');

-- Actualizar estado de pedido: temporal desde el panel admin (mismo TODO).
create policy "orders_temp_update"
  on orders for update
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- PERFILES DE USUARIO
-- ---------------------------------------------------------------------
create table if not exists user_profiles (
  id text primary key, -- Firebase UID por ahora
  email text,
  display_name text,
  photo_url text,
  phone text,
  address text,
  default_payment_method_id uuid,
  updated_at timestamptz not null default now()
);

alter table user_profiles enable row level security;

create policy "user_profiles_temp_all"
  on user_profiles for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- MÉTODOS DE PAGO (legacy / solo referencia visual)
-- Recomendación: una vez Stripe esté activo, esta tabla deja de ser
-- necesaria para cobrar -- Stripe guarda las tarjetas reales del cliente
-- de forma segura (Customer + Payment Methods de Stripe). Ver notas al
-- final del mensaje.
-- ---------------------------------------------------------------------
create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references user_profiles(id) on delete cascade,
  type text not null check (type in ('card','bank','paypal')),
  name text not null,
  last_four text,
  expiry_date text,
  bank_name text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table payment_methods enable row level security;

create policy "payment_methods_temp_all"
  on payment_methods for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- ADMINS (para cuando migremos el login a Supabase Auth)
-- ---------------------------------------------------------------------
create table if not exists admins (
  uid text primary key, -- Firebase UID por ahora, luego auth.users.id
  email text,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

create policy "admins_temp_read"
  on admins for select
  using (true);

-- ---------------------------------------------------------------------
-- Realtime: habilitar para que subscribeToProducts / subscribeToOrders
-- reciban cambios en vivo (equivalente a onSnapshot de Firestore)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;
