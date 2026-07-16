import { useMemo } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

interface CustomerSummary {
  name: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate?: string;
}

export function CustomersManager() {
  const { orders, loading } = useOrders();

  const customers = useMemo(() => {
    const byPhone = new Map<string, CustomerSummary>();
    for (const order of orders) {
      const key = order.customer.phone || order.customer.name;
      const existing = byPhone.get(key);
      if (existing) {
        existing.ordersCount += 1;
        existing.totalSpent += order.total;
        if (!existing.lastOrderDate || (order.createdAt && order.createdAt > existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        byPhone.set(key, {
          name: order.customer.name,
          phone: order.customer.phone,
          ordersCount: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
        });
      }
    }
    return Array.from(byPhone.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <div className="bg-card border border-white/8 rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/8">
        <h3 className="font-semibold">Clientes ({customers.length})</h3>
        <p className="text-muted-foreground text-xs mt-0.5">Derivado de los pedidos existentes, agrupado por teléfono.</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--site-primary)' }} />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Todavía no hay clientes con pedidos</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {customers.map((c) => (
            <div key={c.phone + c.name} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
              >
                {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-muted-foreground text-xs">{c.phone}</p>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">${c.totalSpent.toFixed(2)}</p>
                <p className="text-muted-foreground text-xs">{c.ordersCount} pedido{c.ordersCount !== 1 ? 's' : ''}</p>
              </div>
              {c.lastOrderDate && (
                <span className="text-muted-foreground text-xs hidden md:block">
                  Última: {new Date(c.lastOrderDate).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
