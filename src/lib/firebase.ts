import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

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

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  createdAt: Timestamp | null;
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
