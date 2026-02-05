import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy, where, serverTimestamp, Timestamp, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCFK5dAj4z2mGymaTbe7b5aMyVxvW5EKrM",
  authDomain: "urban-shop-362d1.firebaseapp.com",
  projectId: "urban-shop-362d1",
  storageBucket: "urban-shop-362d1.firebasestorage.app",
  messagingSenderId: "964832964814",
  appId: "1:964832964814:web:4a50515319c2206bb6609f",
  measurementId: "G-8ZYPBK4JMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Set persistence to LOCAL (persists even after browser close)
// This promise ensures persistence is configured before auth operations
export const authReady = setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase auth persistence configured successfully");
    return true;
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
    return false;
  });

// Types
export interface Product {
  id?: string;          // El ? significa que es opcional (se crea en la base de datos)
  name: string;
  price: number;
  description: string;
  icon?: string;        // Lo dejamos opcional para que no den error los productos viejos
  image: string;        // <--- NUEVO
  paymentUrl: string;   // <--- NUEVO
  createdAt: any;
}
export interface OrderItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  quantity: number;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  createdAt: Timestamp | null;
  date: string;
}

// Products
export const productsCollection = collection(db, 'products');
export const ordersCollection = collection(db, 'orders');

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
  return await addDoc(productsCollection, {
    ...product,
    createdAt: serverTimestamp()
  });
};

export const deleteProduct = async (id: string) => {
  return await deleteDoc(doc(db, 'products', id));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = query(productsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(products);
  });
};

// Orders
export const addOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
  return await addDoc(ordersCollection, {
    ...order,
    createdAt: serverTimestamp()
  });
};

export const deleteOrder = async (id: string) => {
  return await deleteDoc(doc(db, 'orders', id));
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(ordersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  });
};

export { serverTimestamp };

// User Profile Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface PaymentMethod {
  id?: string;
  userId: string;
  type: 'card' | 'bank' | 'paypal';
  name: string; // Card holder name or account name
  lastFour?: string; // Last 4 digits for cards
  expiryDate?: string; // MM/YY for cards
  bankName?: string; // For bank accounts
  isDefault: boolean;
  createdAt: Timestamp | null;
}

export interface UserOrder {
  id?: string;
  userId: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Timestamp | null;
  date: string;
}

// Collections
export const userProfilesCollection = collection(db, 'userProfiles');
export const paymentMethodsCollection = collection(db, 'paymentMethods');
export const userOrdersCollection = collection(db, 'userOrders');

// User Profile Functions
export const createOrUpdateUserProfile = async (profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) => {
  const userDocRef = doc(db, 'userProfiles', profile.uid);
  const existingDoc = await getDoc(userDocRef);

  if (existingDoc.exists()) {
    await updateDoc(userDocRef, {
      ...profile,
      updatedAt: serverTimestamp()
    });
  } else {
    await setDoc(userDocRef, {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, 'userProfiles', uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  const userDocRef = doc(db, 'userProfiles', uid);
  await updateDoc(userDocRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

// Payment Methods Functions
export const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>) => {
  // If this is set as default, remove default from others
  if (paymentMethod.isDefault) {
    const q = query(paymentMethodsCollection, where('userId', '==', paymentMethod.userId), where('isDefault', '==', true));
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      await updateDoc(doc(db, 'paymentMethods', docSnap.id), { isDefault: false });
    });
  }

  return await addDoc(paymentMethodsCollection, {
    ...paymentMethod,
    createdAt: serverTimestamp()
  });
};

export const deletePaymentMethod = async (id: string) => {
  return await deleteDoc(doc(db, 'paymentMethods', id));
};

export const subscribeToPaymentMethods = (userId: string, callback: (methods: PaymentMethod[]) => void) => {
  const q = query(paymentMethodsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const methods: PaymentMethod[] = [];
    snapshot.forEach((docSnap) => {
      methods.push({ id: docSnap.id, ...docSnap.data() } as PaymentMethod);
    });
    callback(methods);
  });
};

export const setDefaultPaymentMethod = async (userId: string, methodId: string) => {
  // Remove default from all methods for this user
  const q = query(paymentMethodsCollection, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  snapshot.forEach(async (docSnap) => {
    await updateDoc(doc(db, 'paymentMethods', docSnap.id), { isDefault: false });
  });

  // Set the new default
  await updateDoc(doc(db, 'paymentMethods', methodId), { isDefault: true });
};

// User Orders Functions
export const addUserOrder = async (order: Omit<UserOrder, 'id' | 'createdAt'>) => {
  return await addDoc(userOrdersCollection, {
    ...order,
    createdAt: serverTimestamp()
  });
};

export const subscribeToUserOrders = (userId: string, callback: (orders: UserOrder[]) => void) => {
  const q = query(userOrdersCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: UserOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as UserOrder);
    });
    callback(orders);
  });
};

export const updateOrderStatus = async (orderId: string, status: UserOrder['status']) => {
  await updateDoc(doc(db, 'userOrders', orderId), { status });
};
