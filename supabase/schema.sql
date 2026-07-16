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
-- CATEGORÍAS (rediseño admin — reemplaza la lista hardcodeada en
-- ProductsManager). products.category sigue siendo texto libre, sin FK
-- dura, para no romper productos existentes.
-- ---------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text,
  image text,
  gradient text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

create policy "categories_public_read"
  on categories for select
  using (true);

-- Mismo TODO de seguridad que products_temp_write (ver nota arriba).
create policy "categories_temp_write"
  on categories for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- RESEÑAS (rediseño admin — moderación desde /admin, mostradas en
-- /product/:id)
-- ---------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  author text not null,
  rating int not null check (rating between 1 and 5),
  text text,
  visible boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product_id on reviews (product_id);

alter table reviews enable row level security;

create policy "reviews_public_read"
  on reviews for select
  using (true);

create policy "reviews_temp_write"
  on reviews for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- CONFIGURACIÓN VISUAL DEL SITIO (banner, promo, preset estacional)
-- Fila única (id = 1).
-- ---------------------------------------------------------------------
create table if not exists site_settings (
  id int primary key default 1,
  banner_enabled boolean not null default false,
  banner_text text,
  banner_color text,
  promo_enabled boolean not null default false,
  promo_title text,
  promo_code text,
  promo_discount text,
  bg_preset text not null default 'default',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "site_settings_public_read"
  on site_settings for select
  using (true);

create policy "site_settings_temp_write"
  on site_settings for all
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- PRODUCTOS — campos adicionales para el editor fiel al rediseño
-- (precio original/badge/specs/stock). Migración incremental sobre la
-- tabla `products` ya existente, sin romper filas previas.
-- ---------------------------------------------------------------------
alter table products add column if not exists original_price numeric(10,2);
alter table products add column if not exists badge text;
alter table products add column if not exists specs jsonb not null default '[]'::jsonb;
alter table products add column if not exists in_stock boolean not null default true;

-- ---------------------------------------------------------------------
-- PRODUCTOS — galería de imágenes (varias fotos por producto). `image`
-- se mantiene como la principal/portada por compatibilidad con el resto
-- del sitio (carrito, tarjetas de producto, panel admin).
-- ---------------------------------------------------------------------
alter table products add column if not exists images jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------
-- PERFILES DE USUARIO — campos adicionales para la página de Cuenta
-- fiel al rediseño (nombre/apellido, fecha de nacimiento, documento, bio,
-- libreta de direcciones, preferencias de notificaciones).
-- ---------------------------------------------------------------------
alter table user_profiles add column if not exists first_name text;
alter table user_profiles add column if not exists last_name text;
alter table user_profiles add column if not exists date_of_birth text;
alter table user_profiles add column if not exists id_document text;
alter table user_profiles add column if not exists bio text;
alter table user_profiles add column if not exists addresses jsonb not null default '[]'::jsonb;
alter table user_profiles add column if not exists notification_prefs jsonb not null default '{"email":true,"sms":false,"marketing":true,"twofa":false}'::jsonb;
alter table user_profiles add column if not exists created_at timestamptz not null default now();

-- ---------------------------------------------------------------------
-- ---------------------------------------------------------------------
-- PEDIDOS — email del cliente, para el correo de confirmación de compra.
-- ---------------------------------------------------------------------
alter table orders add column if not exists customer_email text;

-- ---------------------------------------------------------------------
-- Realtime: habilitar para que subscribeToProducts / subscribeToOrders
-- reciban cambios en vivo (equivalente a onSnapshot de Firestore)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table categories;
alter publication supabase_realtime add table reviews;
alter publication supabase_realtime add table site_settings;
