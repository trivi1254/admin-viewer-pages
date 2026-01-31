import { useState, useEffect } from 'react';
import { Product, subscribeToProducts } from '@/lib/firebase';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const unsubscribe = subscribeToProducts((data) => {
        setProducts(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      setError('Error al cargar productos');
      setLoading(false);
    }
  }, []);

  return { products, loading, error };
}
