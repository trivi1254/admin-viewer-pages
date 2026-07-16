import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { useSiteVisual } from '@/hooks/useSiteVisual';

export function AppLayout() {
  const { visual } = useSiteVisual();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-bg-preset', visual.bgPreset);
  }, [visual.bgPreset]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
