import { StoreHeader } from '@/components/store/StoreHeader';
import { HeroBanner } from '@/components/store/HeroBanner';
import { ProductGrid } from '@/components/store/ProductGrid';
import { StoreFooter } from '@/components/store/StoreFooter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreHeader />
      <main className="flex-1">
        <HeroBanner />
        <ProductGrid />
      </main>
      <StoreFooter />
    </div>
  );
};

export default Index;
