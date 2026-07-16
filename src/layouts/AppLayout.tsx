import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { useSiteVisual } from '@/hooks/useSiteVisual';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { visual } = useSiteVisual();
  const location = useLocation();
  const [bgLoaded, setBgLoaded] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-bg-preset', visual.bgPreset);
  }, [visual.bgPreset]);

  useEffect(() => {
    setBgLoaded(false);
  }, [visual.heroImageUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-0">
      {visual.heroImageUrl && (
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <img
            src={visual.heroImageUrl}
            alt=""
            fetchPriority="high"
            onLoad={() => setBgLoaded(true)}
            className={cn('w-full h-full object-cover transition-opacity duration-700', bgLoaded ? 'opacity-100' : 'opacity-0')}
          />
          <div className="absolute inset-0 bg-[#0F172A]/80" />
        </div>
      )}
      {visual.bannerEnabled && visual.bannerText && (
        <div
          className="text-center text-sm font-medium py-2 px-4 text-white"
          style={{ background: visual.bannerColor || 'var(--site-primary)' }}
        >
          {visual.bannerText}
        </div>
      )}
      <Navbar />
      <main className="flex-1" key={location.pathname}>
        <div className="page-enter">
          <Outlet />
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
}
