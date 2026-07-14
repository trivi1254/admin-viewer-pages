import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
export const auth = getAuth(app);

/* ========= AUTH READY ========= */

export const authReady = new Promise<void>((resolve) => {
  const unsubscribe = onAuthStateChanged(auth, () => {
    unsubscribe();
    resolve();
  });
});

/* =========================================================================
   Nota: toda la parte de datos (products, orders, perfiles, métodos de
   pago, admins) que antes vivía aquí se movió a `src/lib/database.ts`,
   ahora sobre Supabase. Este archivo solo mantiene lo necesario para el
   login con Firebase Auth, que se migra en la siguiente fase.
   ========================================================================= */
