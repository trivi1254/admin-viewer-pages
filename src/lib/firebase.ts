import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';




/* ========= CONFIG ========= */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/* ========= INIT ========= */

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);      // 🔥 ESTO ARREGLA EL ERROR
export const db = getFirestore(app);

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
  createdAt?: any;
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
  updatedAt?: any;
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
  createdAt?: any;
}

export interface UserOrder {
  id?: string;
  orderId?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  createdAt?: any;
  statusHistory?: StatusHistoryEntry[];
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
  date?: string;
  createdAt?: any;
  statusHistory?: StatusHistoryEntry[];
}

/* ========= PRODUCTOS ========= */

export function subscribeToProducts(
  callback: (products: Product[]) => void
) {
  const q = query(
    collection(db, 'products'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const products: Product[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, 'id'>),
    }));

    callback(products);
  });
}
/* ========= PRODUCTOS (ADMIN) ========= */

export async function addProduct(productData: any) {
  const docRef = await addDoc(collection(db, 'products'), {
    ...productData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}
/* ========= ACTUALIZAR PRODUCTO (ADMIN) ========= */

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id'>>) {
  const ref = doc(db, 'products', productId);
  await updateDoc(ref, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
}

/* ========= ELIMINAR PRODUCTO (ADMIN) ========= */

export async function deleteProduct(productId: string) {
  const ref = doc(db, 'products', productId);
  await deleteDoc(ref);
}
/* ========= PEDIDOS (ADMIN) ========= */

export async function deleteOrder(orderId: string) {
  const ref = doc(db, 'orders', orderId);
  await deleteDoc(ref);
}

/* ========= ACTUALIZAR ESTADO DE PEDIDO (ADMIN) ========= */

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  message: string,
  userId?: string
) {
  // Update in main orders collection
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error('Pedido no encontrado');
  }

  const orderData = orderSnap.data();
  const existingHistory = orderData.statusHistory || [];

  const newEntry: StatusHistoryEntry = {
    status,
    message,
    date: new Date().toISOString(),
  };

  await updateDoc(orderRef, {
    status,
    statusHistory: [...existingHistory, newEntry],
    updatedAt: serverTimestamp(),
  });

  // Also update the user's personal order subcollection
  const orderUserId = userId || orderData.userId;
  if (orderUserId) {
    const userOrdersRef = collection(db, 'users', orderUserId, 'orders');
    const userOrdersSnapshot = await new Promise<any>((resolve) => {
      const unsub = onSnapshot(query(userOrdersRef), (snap) => {
        unsub();
        resolve(snap);
      });
    });

    // Match user order by date field (shared between admin and user orders)
    const orderDate = orderData.date;
    for (const orderDoc of userOrdersSnapshot.docs) {
      const data = orderDoc.data();
      if (data.date === orderDate) {
        const userOrderRef = doc(db, 'users', orderUserId, 'orders', orderDoc.id);
        const existingUserHistory = data.statusHistory || [];
        await updateDoc(userOrderRef, {
          status,
          statusHistory: [...existingUserHistory, newEntry],
          updatedAt: serverTimestamp(),
        });
        break;
      }
    }
  }
}


/* ========= SUBSCRIPCIÓN PEDIDOS (ADMIN) ========= */

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];

    callback(orders);
  }, (error) => {
    if (onError) onError(error);
  });
}

/* ========= PEDIDOS ========= */

export async function addOrder(orderData: any) {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/* ========= PEDIDOS POR USUARIO ========= */

export async function addUserOrder(
  userId: string,
  orderId: string,
  orderData: any
) {
  const ref = doc(db, 'users', userId, 'orders', orderId);

  await setDoc(ref, {
    ...orderData,
    orderId,
    createdAt: serverTimestamp(),
  });
}

/* ========= PERFIL DE USUARIO ========= */

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as UserProfile;
}
/* ========= ACTUALIZAR PERFIL DE USUARIO ========= */

export async function updateUserProfile(
  userId: string,
  data: any
) {
  const ref = doc(db, 'users', userId);

  // First check if document exists
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Use updateDoc for existing documents (doesn't require full document structure)
    await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    // Create document if it doesn't exist
    await setDoc(ref, {
      uid: userId,
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
}

/* ========= AUTH READY ========= */

export const authReady = new Promise<void>((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve();
  });
});
/* ========= CREAR / ACTUALIZAR PERFIL ========= */

export async function createOrUpdateUserProfile(
  userId: string,
  data: any
) {
  const ref = doc(db, 'users', userId);

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true } // 🔥 no borra datos anteriores
  );
}
/* ========= MÉTODOS DE PAGO ========= */

export function subscribeToPaymentMethods(
  userId: string,
  callback: (methods: PaymentMethod[]) => void
) {
  const q = query(
    collection(db, 'users', userId, 'paymentMethods'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const methods = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(methods);
  });
}
/* ========= MÉTODO DE PAGO POR DEFECTO ========= */

export async function setDefaultPaymentMethod(
  userId: string,
  paymentMethodId: string
) {
  const ref = doc(db, 'users', userId);

  await setDoc(
    ref,
    {
      defaultPaymentMethod: paymentMethodId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/* ========= AÑADIR MÉTODO DE PAGO ========= */

export async function addPaymentMethod(
  userId: string,
  methodData: any
) {
  // Ensure the user document exists before adding to subcollection
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: userId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  const docRef = await addDoc(
    collection(db, 'users', userId, 'paymentMethods'),
    {
      ...methodData,
      userId,
      createdAt: serverTimestamp(),
    }
  );

  return docRef.id;
} 
/* ========= BORRAR MÉTODO DE PAGO ========= */

export async function deletePaymentMethod(
  userId: string,
  methodId: string
) {
  const ref = doc(db, 'users', userId, 'paymentMethods', methodId);
  await deleteDoc(ref);
}   
/* ========= PEDIDOS DEL USUARIO ========= */

export function subscribeToUserOrders(
  userId: string,
  callback: (orders: UserOrder[]) => void
) {
  const q = query(
    collection(db, 'users', userId, 'orders'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(orders);
  });
}
/* ========= DETALLES DEL PEDIDO ========= */

export async function getOrderDetails(
  userId: string,
  orderId: string
) {
  const ref = doc(db, 'users', userId, 'orders', orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/* ========= ADMIN VERIFICATION ========= */

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const ref = doc(db, 'admins', uid);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function setAdminUser(uid: string, email: string) {
  const ref = doc(db, 'admins', uid);
  await setDoc(ref, {
    email,
    createdAt: serverTimestamp(),
  });
}
