import { useState, useEffect } from 'react';
import { Order, subscribeToOrders } from '@/lib/firebase';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const unsubscribe = subscribeToOrders((data) => {
        setOrders(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      setError('Error al cargar pedidos');
      setLoading(false);
    }
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
