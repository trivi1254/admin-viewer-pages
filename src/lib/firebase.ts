import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/* =========================
   CONFIG FIREBASE
   ========================= */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* =========================
   PEDIDOS
   ========================= */

// Pedido general (admin)
export const addOrder = async (orderData: any) => {
  if (!auth.currentUser) {
    throw new Error('Usuario no autenticado');
  }

  return await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp()
  });
};

// Pedido del usuario
export const addUserOrder = async (orderData: any) => {
  if (!auth.currentUser) {
    throw new Error('Usuario no autenticado');
  }

  const userId = auth.currentUser.uid;

  return await addDoc(
    collection(db, `users/${userId}/orders`),
    {
      ...orderData,
      createdAt: serverTimestamp()
    }
  );
};

/* =========================
   PERFIL USUARIO
   ========================= */

export const getUserProfile = async (uid: string) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return snap.data();
};
