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
  serverTimestamp,
} from 'firebase/firestore';
import { deleteDoc } from 'firebase/firestore';




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
  createdAt?: any;
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
/* ========= PRODUCTOS (ADMIN) ========= */

export async function deleteProduct(productId: string) {
  const ref = doc(db, 'products', productId);
  await deleteDoc(ref);
}
/* ========= PEDIDOS (ADMIN) ========= */

export async function deleteOrder(orderId: string) {
  const ref = doc(db, 'orders', orderId);
  await deleteDoc(ref);
}


/* ========= SUBSCRIPCIÓN PEDIDOS (ADMIN) ========= */

export function subscribeToOrders(
  callback: (orders: any[]) => void
) {
  const q = query(
    collection(db, 'orders'),
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

export async function getUserProfile(userId: string) {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}
/* ========= AUTH READY ========= */

export const authReady = new Promise<void>((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve();
  });
});

