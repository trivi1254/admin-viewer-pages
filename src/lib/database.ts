import { supabase } from '@/lib/supabase';

/*
 * Los nombres de canal de Supabase Realtime deben ser únicos por suscripción
 * activa — si dos componentes montan el mismo hook a la vez (ej. AppLayout +
 * una página, ambas leyendo site_settings), reusar el mismo nombre de canal
 * hace que `.on()` se llame sobre un canal ya suscrito y lance error. Se
 * agrega un sufijo incremental a cada canal para evitar la colisión.
 */
let channelSeq = 0;
function uniqueChannel(name: string) {
  return `${name}-${++channelSeq}`;
}

/* =========================================================================
   Capa de datos sobre Supabase. Reemplaza las funciones de datos que antes
   vivían en `firebase.ts` (products, orders, perfiles, métodos de pago,
   admins). El login/Auth se queda en Firebase por ahora — eso se migra en
   la siguiente fase. Los tipos mantienen la misma forma que antes para no
   romper los componentes que ya los usan.
   ========================================================================= */

/* ========= TIPOS ========= */

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: 'Sale' | 'New' | 'Best Seller';
  image?: string;
  images?: string[];
  icon?: string;
  description?: string;
  category?: string;
  paymentUrl?: string;
  specs?: ProductSpec[];
  inStock: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  marketing: boolean;
  twofa: boolean;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  idDocument?: string;
  bio?: string;
  addresses?: Address[];
  notificationPrefs?: NotificationPrefs;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id?: string;
  userId: string;
  type: 'card' | 'bank' | 'paypal';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  bankName?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface StatusHistoryEntry {
  status: string;
  message: string;
  date: string;
}

export interface Order {
  id: string;
  userId?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentProvider?: 'stripe' | 'whatsapp';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded' | 'failed';
  date?: string;
  createdAt?: string;
  statusHistory?: StatusHistoryEntry[];
}

export type UserOrder = Order;

export interface Category {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  gradient?: string;
  sortOrder: number;
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text?: string;
  visible: boolean;
  featured: boolean;
  createdAt?: string;
}

export interface SiteVisual {
  bannerEnabled: boolean;
  bannerText: string;
  bannerColor: string;
  promoEnabled: boolean;
  promoTitle: string;
  promoCode: string;
  promoDiscount: string;
  bgPreset: string;
}

/* ========= MAPPERS (snake_case DB -> camelCase app) ========= */

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    originalPrice: row.original_price !== null && row.original_price !== undefined ? Number(row.original_price) : undefined,
    badge: row.badge ?? undefined,
    image: row.image ?? undefined,
    images: row.images ?? [],
    icon: row.icon ?? undefined,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    paymentUrl: row.payment_url ?? undefined,
    specs: row.specs ?? [],
    inStock: row.in_stock ?? true,
    createdAt: row.created_at,
  };
}

function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    customer: {
      name: row.customer_name,
      phone: row.customer_phone,
      address: row.customer_address,
    },
    items: row.items ?? [],
    total: Number(row.total),
    status: row.status,
    paymentProvider: row.payment_provider,
    paymentStatus: row.payment_status,
    date: row.created_at,
    createdAt: row.created_at,
    statusHistory: row.status_history ?? [],
  };
}

function mapUserProfile(row: any): UserProfile {
  return {
    id: row.id,
    uid: row.id,
    email: row.email,
    displayName: row.display_name ?? undefined,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    photoURL: row.photo_url ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    idDocument: row.id_document ?? undefined,
    bio: row.bio ?? undefined,
    addresses: row.addresses ?? [],
    notificationPrefs: row.notification_prefs ?? { email: true, sms: false, marketing: true, twofa: false },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? undefined,
    image: row.image ?? undefined,
    gradient: row.gradient ?? undefined,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
  };
}

function mapReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: Number(row.rating),
    text: row.text ?? undefined,
    visible: row.visible,
    featured: row.featured,
    createdAt: row.created_at,
  };
}

function mapSiteVisual(row: any): SiteVisual {
  return {
    bannerEnabled: row.banner_enabled,
    bannerText: row.banner_text ?? '',
    bannerColor: row.banner_color ?? '#3B82F6',
    promoEnabled: row.promo_enabled,
    promoTitle: row.promo_title ?? '',
    promoCode: row.promo_code ?? '',
    promoDiscount: row.promo_discount ?? '',
    bgPreset: row.bg_preset ?? 'default',
  };
}

function mapPaymentMethod(row: any): PaymentMethod {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    name: row.name,
    lastFour: row.last_four ?? undefined,
    expiryDate: row.expiry_date ?? undefined,
    bankName: row.bank_name ?? undefined,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

/* ========= PRODUCTOS ========= */

export function subscribeToProducts(callback: (products: Product[]) => void) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!cancelled && !error && data) callback(data.map(mapProduct));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel('products-changes'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, load)
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function addProduct(productData: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: productData.name,
      price: productData.price,
      original_price: productData.originalPrice ?? null,
      badge: productData.badge ?? null,
      image: productData.image,
      images: productData.images ?? [],
      icon: productData.icon,
      description: productData.description,
      category: productData.category,
      payment_url: productData.paymentUrl,
      specs: productData.specs ?? [],
      in_stock: productData.inStock ?? true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateProduct(productId: string, productData: Partial<Product>) {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (productData.name !== undefined) payload.name = productData.name;
  if (productData.price !== undefined) payload.price = productData.price;
  if (productData.originalPrice !== undefined) payload.original_price = productData.originalPrice ?? null;
  if (productData.badge !== undefined) payload.badge = productData.badge ?? null;
  if (productData.image !== undefined) payload.image = productData.image;
  if (productData.images !== undefined) payload.images = productData.images;
  if (productData.icon !== undefined) payload.icon = productData.icon;
  if (productData.description !== undefined) payload.description = productData.description;
  if (productData.category !== undefined) payload.category = productData.category;
  if (productData.paymentUrl !== undefined) payload.payment_url = productData.paymentUrl;
  if (productData.specs !== undefined) payload.specs = productData.specs;
  if (productData.inStock !== undefined) payload.in_stock = productData.inStock;

  const { error } = await supabase.from('products').update(payload).eq('id', productId);
  if (error) throw error;
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw error;
}

/* ========= PEDIDOS ========= */

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (cancelled) return;
    if (error) {
      onError?.(new Error(error.message));
      return;
    }
    callback((data ?? []).map(mapOrder));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel('orders-changes'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, load)
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export function subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!cancelled && !error && data) callback(data.map(mapOrder));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel(`orders-user-${userId}`))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
      load
    )
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function getOrderDetails(userId: string, orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapOrder(data);
}

/**
 * Crea un pedido SIN pago online (flujo WhatsApp: coordinación manual).
 * Los pedidos pagados con Stripe NO se crean aquí — los crea el webhook
 * de Stripe en el servidor, una vez confirmado el pago real.
 */
export async function addOrder(orderData: {
  userId?: string;
  customer: { name: string; phone: string; address: string };
  items: OrderItem[];
  total: number;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.userId,
      customer_name: orderData.customer.name,
      customer_phone: orderData.customer.phone,
      customer_address: orderData.customer.address,
      items: orderData.items,
      total: orderData.total,
      payment_provider: 'whatsapp',
      payment_status: 'unpaid',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function deleteOrder(orderId: string) {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) throw error;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  message: string,
  _userId?: string
) {
  const { data: current, error: fetchError } = await supabase
    .from('orders')
    .select('status_history')
    .eq('id', orderId)
    .single();

  if (fetchError) throw fetchError;

  const newEntry: StatusHistoryEntry = {
    status,
    message,
    date: new Date().toISOString(),
  };
  const updatedHistory = [...(current.status_history ?? []), newEntry];

  const { error } = await supabase
    .from('orders')
    .update({ status, status_history: updatedHistory, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw error;
}

/* ========= PERFIL DE USUARIO ========= */

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapUserProfile(data);
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>) {
  await createOrUpdateUserProfile(userId, data);
}

export async function createOrUpdateUserProfile(userId: string, data: Partial<UserProfile>) {
  const payload: Record<string, unknown> = { id: userId, updated_at: new Date().toISOString() };
  if (data.email !== undefined) payload.email = data.email;
  if (data.displayName !== undefined) payload.display_name = data.displayName;
  if (data.firstName !== undefined) payload.first_name = data.firstName;
  if (data.lastName !== undefined) payload.last_name = data.lastName;
  if (data.photoURL !== undefined) payload.photo_url = data.photoURL;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.address !== undefined) payload.address = data.address;
  if (data.dateOfBirth !== undefined) payload.date_of_birth = data.dateOfBirth;
  if (data.idDocument !== undefined) payload.id_document = data.idDocument;
  if (data.bio !== undefined) payload.bio = data.bio;
  if (data.addresses !== undefined) payload.addresses = data.addresses;
  if (data.notificationPrefs !== undefined) payload.notification_prefs = data.notificationPrefs;

  const { error } = await supabase.from('user_profiles').upsert(payload);
  if (error) throw error;
}

/* ========= MÉTODOS DE PAGO (legacy — ver nota sobre Stripe) ========= */

export function subscribeToPaymentMethods(
  userId: string,
  callback: (methods: PaymentMethod[]) => void
) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!cancelled && !error && data) callback(data.map(mapPaymentMethod));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel(`payment-methods-${userId}`))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'payment_methods', filter: `user_id=eq.${userId}` },
      load
    )
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function addPaymentMethod(userId: string, methodData: Partial<PaymentMethod>) {
  await createOrUpdateUserProfile(userId, {}); // asegura que exista el perfil

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: userId,
      type: methodData.type,
      name: methodData.name,
      last_four: methodData.lastFour,
      expiry_date: methodData.expiryDate,
      bank_name: methodData.bankName,
      is_default: methodData.isDefault ?? false,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function deletePaymentMethod(userId: string, methodId: string) {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', methodId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      default_payment_method_id: paymentMethodId,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}

/* ========= ADMIN VERIFICATION ========= */

export async function checkIsAdmin(uid: string): Promise<boolean> {
  const { data, error } = await supabase.from('admins').select('uid').eq('uid', uid).maybeSingle();
  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
  return !!data;
}

export async function setAdminUser(uid: string, email: string) {
  const { error } = await supabase.from('admins').upsert({ uid, email });
  if (error) throw error;
}

/* ========= CATEGORÍAS ========= */

export function subscribeToCategories(callback: (categories: Category[]) => void) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!cancelled && !error && data) callback(data.map(mapCategory));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel('categories-changes'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, load)
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function addCategory(data: Partial<Category>) {
  const { data: row, error } = await supabase
    .from('categories')
    .insert({
      name: data.name,
      icon: data.icon,
      image: data.image,
      gradient: data.gradient,
      sort_order: data.sortOrder ?? 0,
    })
    .select('id')
    .single();

  if (error) throw error;
  return row.id as string;
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.icon !== undefined) payload.icon = data.icon;
  if (data.image !== undefined) payload.image = data.image;
  if (data.gradient !== undefined) payload.gradient = data.gradient;
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;

  const { error } = await supabase.from('categories').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

/* ========= RESEÑAS ========= */

export function subscribeToReviews(callback: (reviews: Review[]) => void) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!cancelled && !error && data) callback(data.map(mapReview));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel('reviews-changes'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, load)
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export function subscribeToProductReviews(productId: string, callback: (reviews: Review[]) => void) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('visible', true)
      .order('created_at', { ascending: false });
    if (!cancelled && !error && data) callback(data.map(mapReview));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel(`reviews-product-${productId}`))
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reviews', filter: `product_id=eq.${productId}` },
      load
    )
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function addReview(data: {
  productId: string;
  author: string;
  rating: number;
  text?: string;
}) {
  const { data: row, error } = await supabase
    .from('reviews')
    .insert({
      product_id: data.productId,
      author: data.author,
      rating: data.rating,
      text: data.text,
    })
    .select('id')
    .single();

  if (error) throw error;
  return row.id as string;
}

export async function updateReview(id: string, data: Partial<Pick<Review, 'visible' | 'featured'>>) {
  const payload: Record<string, unknown> = {};
  if (data.visible !== undefined) payload.visible = data.visible;
  if (data.featured !== undefined) payload.featured = data.featured;

  const { error } = await supabase.from('reviews').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

/* ========= CONFIGURACIÓN VISUAL DEL SITIO ========= */

export function subscribeToSiteVisual(callback: (visual: SiteVisual) => void) {
  let cancelled = false;

  const load = async () => {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (!cancelled && !error && data) callback(mapSiteVisual(data));
  };

  load();

  const channel = supabase
    .channel(uniqueChannel('site-settings-changes'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, load)
    .subscribe();

  return () => {
    cancelled = true;
    supabase.removeChannel(channel);
  };
}

export async function updateSiteVisual(data: Partial<SiteVisual>) {
  const payload: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
  if (data.bannerEnabled !== undefined) payload.banner_enabled = data.bannerEnabled;
  if (data.bannerText !== undefined) payload.banner_text = data.bannerText;
  if (data.bannerColor !== undefined) payload.banner_color = data.bannerColor;
  if (data.promoEnabled !== undefined) payload.promo_enabled = data.promoEnabled;
  if (data.promoTitle !== undefined) payload.promo_title = data.promoTitle;
  if (data.promoCode !== undefined) payload.promo_code = data.promoCode;
  if (data.promoDiscount !== undefined) payload.promo_discount = data.promoDiscount;
  if (data.bgPreset !== undefined) payload.bg_preset = data.bgPreset;

  const { error } = await supabase.from('site_settings').upsert(payload);
  if (error) throw error;
}
