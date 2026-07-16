import { useState, useEffect } from 'react';
import { SiteVisual, subscribeToSiteVisual } from '@/lib/database';

const DEFAULT_VISUAL: SiteVisual = {
  bannerEnabled: false,
  bannerText: '',
  bannerColor: '#3B82F6',
  promoEnabled: false,
  promoTitle: '',
  promoCode: '',
  promoDiscount: '',
  bgPreset: 'default',
};

export function useSiteVisual() {
  const [visual, setVisual] = useState<SiteVisual>(DEFAULT_VISUAL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSiteVisual((data) => {
      setVisual(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { visual, loading };
}
