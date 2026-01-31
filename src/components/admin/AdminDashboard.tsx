import { motion } from 'framer-motion';
import { Store, LogOut, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { ProductsManager } from './ProductsManager';
import { OrdersPanel } from './OrdersPanel';

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { products } = useProducts();
  const { orders, getTotalRevenue, getTodayOrders } = useOrders();

  const stats = [
    {
      label: 'Productos',
      value: products.length.toString(),
      icon: Package,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Pedidos Total',
      value: orders.length.toString(),
      icon: ShoppingBag,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: 'Ventas Totales',
      value: `$${getTotalRevenue().toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      label: 'Pedidos Hoy',
      value: getTodayOrders().toString(),
      icon: TrendingUp,
      color: 'bg-amber-500/10 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-gradient">Panel Admin</span>
              <p className="text-xs text-muted-foreground">Urban Shop</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <Store className="h-4 w-4" />
                Ver Tienda
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onLogout}
              className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
