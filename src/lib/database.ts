import { supabase } from '@/lib/supabase';

/* =========================================================================
   Capa de datos sobre Supabase. Reemplaza las funciones de datos que antes
   vivían en `firebase.ts` (products, orders, perfiles, métodos de pago,
   admins). El login/Auth se queda en Firebase por ahora — eso se migra en
   la siguiente fase. Los tipos mantienen la misma forma que antes para no
   romper los componentes que ya los usan.
   ========================================================================= */

/* ========= TIPOS ========= */

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  icon?: string;
  description?: string;
  category?: string;
  paymentUrl?: string;
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

export interface UserProfile {
  id?: string;
  uid?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  address?: string;
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

/* ========= MAPPERS (snake_case DB -> camelCase app) ========= */

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    image: row.image ?? undefined,
    icon: row.icon ?? undefined,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    paymentUrl: row.payment_url ?? undefined,
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
    photoURL: row.photo_url ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    updatedAt: row.updated_at,
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
    .channel('products-changes')
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
      image: productData.image,
      icon: productData.icon,
      description: productData.description,
      category: productData.category,
      payment_url: productData.paymentUrl,
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
  if (productData.image !== undefined) payload.image = productData.image;
  if (productData.icon !== undefined) payload.icon = productData.icon;
  if (productData.description !== undefined) payload.description = productData.description;
  if (productData.category !== undefined) payload.category = productData.category;
  if (productData.paymentUrl !== undefined) payload.payment_url = productData.paymentUrl;

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
    .channel('orders-changes')
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
    .channel(`orders-user-${userId}`)
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
  if (data.photoURL !== undefined) payload.photo_url = data.photoURL;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.address !== undefined) payload.address = data.address;

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
    .channel(`payment-methods-${userId}`)
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
