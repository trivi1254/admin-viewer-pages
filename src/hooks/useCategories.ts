import { useState, useEffect } from 'react';
import { Category, subscribeToCategories } from '@/lib/database';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCategories((data) => {
      setCategories(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { categories, loading };
}
