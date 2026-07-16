import { useState, useEffect, useMemo } from 'react';
import { Review, subscribeToReviews, subscribeToProductReviews } from '@/lib/database';

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReviews((data) => {
      setReviews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ratingsByProduct = useMemo(() => {
    const map = new Map<string, { rating: number; count: number }>();
    const visible = reviews.filter((r) => r.visible);
    const grouped = new Map<string, number[]>();
    for (const r of visible) {
      const list = grouped.get(r.productId) || [];
      list.push(r.rating);
      grouped.set(r.productId, list);
    }
    for (const [productId, ratings] of grouped) {
      const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
      map.set(productId, { rating: avg, count: ratings.length });
    }
    return map;
  }, [reviews]);

  return { reviews, loading, ratingsByProduct };
}

export function useProductReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToProductReviews(productId, (data) => {
      setReviews(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [productId]);

  return { reviews, loading };
}
