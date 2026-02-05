import { useState, useEffect } from 'react';
import { Order, subscribeToOrders } from '@/lib/firebase';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error al cargar pedidos:', err);
        setError(err.message || 'Error al cargar pedidos');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + (order.total || 0), 0);
  };

  const getTodayOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(o => {
      if (!o.createdAt) return false;
      const orderDate = o.createdAt.toDate();
      return orderDate.toDateString() === today;
    }).length;
  };

  return { orders, loading, error, getTotalRevenue, getTodayOrders };
}
