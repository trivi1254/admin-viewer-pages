import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Badge } from './Badge';
import { useOrders } from '@/hooks/useOrders';
import { Order } from '@/lib/database';

function useMonthlySales(orders: Order[]) {
  return useMemo(() => {
    const now = new Date();
    const months: { key: string; month: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: d.toLocaleDateString('es-ES', { month: 'short' }),
        revenue: 0,
        orders: 0,
      });
    }
    const byKey = new Map(months.map((m) => [m.key, m]));
    for (const order of orders) {
      if (!order.createdAt) continue;
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.revenue += order.total;
        bucket.orders += 1;
      }
    }
    return months;
  }, [orders]);
}

function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--site-primary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--site-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']}
        />
        <Area type="monotone" dataKey="revenue" stroke="var(--site-primary)" fill="url(#revenueGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function OrdersChart({ data }: { data: { month: string; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
        />
        <Bar dataKey="orders" fill="var(--site-primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OverviewTab() {
  const { orders } = useOrders();
  const salesData = useMonthlySales(orders);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-card border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Ingresos</h3>
          <Badge variant="info">Últimos 6 meses</Badge>
        </div>
        <RevenueChart data={salesData} />
      </div>
      <div className="bg-card border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Pedidos</h3>
          <Badge variant="success">{orders.length} total</Badge>
        </div>
        <OrdersChart data={salesData} />
      </div>
    </div>
  );
}
