import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Package, Layers, ClipboardList, MessageSquare, Users, Sparkles,
  Bell, LogOut, Search, X, ShoppingBag, Zap, ChevronRight, DollarSign, TrendingUp,
} from 'lucide-react';
import { Badge } from './Badge';
import { Btn } from '@/components/store/Btn';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useReviews } from '@/hooks/useReviews';
import { ProductsManager } from './ProductsManager';
import { OrdersPanel } from './OrdersPanel';
import { CategoriesManager } from './CategoriesManager';
import { ReviewsManager } from './ReviewsManager';
import { CustomersManager } from './CustomersManager';
import { VisualManager } from './VisualManager';
import { OverviewTab } from './OverviewTab';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabKey = 'overview' | 'products' | 'categories' | 'orders' | 'reviews' | 'customers' | 'visual';

const TABS: { key: TabKey; label: string; icon: typeof BarChart2 }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart2 },
  { key: 'products', label: 'Productos', icon: Package },
  { key: 'categories', label: 'Categorías', icon: Layers },
  { key: 'orders', label: 'Pedidos', icon: ClipboardList },
  { key: 'reviews', label: 'Reseñas', icon: MessageSquare },
  { key: 'customers', label: 'Clientes', icon: Users },
  { key: 'visual', label: 'Visual', icon: Sparkles },
];

interface FeedItem {
  id: string;
  type: 'order' | 'review';
  title: string;
  body: string;
  date: string;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { products } = useProducts();
  const { orders, getTotalRevenue, getTodayOrders } = useOrders();
  const { reviews } = useReviews();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSearch, setNotifSearch] = useState('');
  const [notifFilter, setNotifFilter] = useState<'all' | 'order' | 'review'>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  // Feed de notificaciones real: derivado de pedidos y reseñas recientes
  // (no hay tabla de notificaciones dedicada — el estado "leído" es de sesión).
  const feed: FeedItem[] = useMemo(() => {
    const orderItems: FeedItem[] = orders.slice(0, 8).map((o) => ({
      id: `order-${o.id}`,
      type: 'order',
      title: 'Nuevo pedido',
      body: `#${o.id.slice(0, 8).toUpperCase()} — ${o.customer.name} · $${o.total.toFixed(2)}`,
      date: o.createdAt || new Date().toISOString(),
    }));
    const reviewItems: FeedItem[] = reviews.slice(0, 8).map((r) => ({
      id: `review-${r.id}`,
      type: 'review',
      title: 'Nueva reseña',
      body: `${r.rating}★ de ${r.author}${r.featured ? ' · destacada' : ''}`,
      date: r.createdAt || new Date().toISOString(),
    }));
    return [...orderItems, ...reviewItems].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 15);
  }, [orders, reviews]);

  const unreadCount = feed.filter((n) => !readIds.has(n.id)).length;
  const markAllRead = () => setReadIds(new Set(feed.map((n) => n.id)));
  const markRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));

  const filteredFeed = feed
    .filter((n) => notifFilter === 'all' || n.type === notifFilter)
    .filter((n) => !notifSearch || n.title.toLowerCase().includes(notifSearch.toLowerCase()) || n.body.toLowerCase().includes(notifSearch.toLowerCase()));

  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = [
    { label: 'Ventas Totales', value: `$${getTotalRevenue().toFixed(2)}`, icon: DollarSign },
    { label: 'Pedidos Total', value: orders.length.toString(), icon: ShoppingBag },
    { label: 'Productos Activos', value: products.length.toString(), icon: Package },
    { label: 'Pedidos Hoy', value: getTodayOrders().toString(), icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold capitalize">Panel de Administrador</h1>
            <p className="text-muted-foreground text-sm mt-0.5 capitalize">{today}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/">
              <button className="w-9 h-9 rounded-xl bg-card border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors" title="Ver tienda">
                <Zap size={15} className="text-muted-foreground" />
              </button>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="w-9 h-9 rounded-xl bg-card border border-white/8 flex items-center justify-center hover:bg-white/10 transition-colors relative"
              >
                <Bell size={16} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] text-white flex items-center justify-center font-bold"
                    style={{ background: 'var(--site-primary)' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[360px] bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl z-[60] flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                    <span className="font-semibold text-sm">Notificaciones</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] font-medium transition-colors" style={{ color: 'var(--site-primary)' }}>
                          Marcar todas leídas
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 border-b border-white/8">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={notifSearch}
                        onChange={(e) => setNotifSearch(e.target.value)}
                        placeholder="Buscar notificaciones…"
                        className="w-full bg-background border border-white/8 rounded-xl pl-8 pr-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-1.5 px-4 py-2 border-b border-white/8 overflow-x-auto">
                    {(['all', 'order', 'review'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setNotifFilter(f)}
                        className={cn(
                          'flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-colors border',
                          notifFilter === f ? 'border-transparent text-white' : 'bg-white/5 text-muted-foreground border-white/8 hover:text-foreground'
                        )}
                        style={notifFilter === f ? { background: 'color-mix(in srgb, var(--site-primary) 25%, transparent)', color: 'var(--site-primary)' } : undefined}
                      >
                        {f === 'all' ? `Todas (${feed.length})` : f === 'order' ? 'Pedidos' : 'Reseñas'}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-y-auto max-h-72 divide-y divide-white/5">
                    {filteredFeed.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bell size={22} className="mb-2 opacity-40" />
                        <p className="text-xs">No hay notificaciones</p>
                      </div>
                    ) : (
                      filteredFeed.map((n) => {
                        const Icon = n.type === 'order' ? ShoppingBag : MessageSquare;
                        const isRead = readIds.has(n.id);
                        return (
                          <div
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={cn('flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5', !isRead && 'bg-[color:var(--site-primary)]/5')}
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)', color: 'var(--site-primary)' }}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className={cn('text-xs font-medium truncate', isRead ? 'text-muted-foreground' : 'text-foreground')}>{n.title}</p>
                                {!isRead && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--site-primary)' }} />}
                              </div>
                              <p className="text-muted-foreground text-[11px] mt-0.5 truncate">{n.body}</p>
                              <p className="text-muted-foreground/70 text-[10px] mt-1">{new Date(n.date).toLocaleString('es-ES')}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {feed.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-white/8 flex justify-between items-center">
                      <span className="text-muted-foreground/70 text-[11px]">{unreadCount} sin leer</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-card border border-white/8 rounded-xl px-3 py-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
              >
                A
              </div>
              <span className="text-sm hidden sm:block">Admin</span>
            </div>
            <button
              onClick={onLogout}
              className="w-9 h-9 rounded-xl bg-card border border-white/8 flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={15} className="text-muted-foreground hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-white/8 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === t.key ? 'bg-[#334155] text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{s.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)' }}>
                  <s.icon size={14} style={{ color: 'var(--site-primary)' }} />
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab />}

        {(activeTab === 'overview' || activeTab === 'orders') && (
          <div className="bg-card border border-white/8 rounded-2xl mt-6 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="font-semibold">Pedidos Recientes</h3>
              {activeTab === 'overview' && (
                <Btn variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                  Ver todos <ChevronRight size={13} />
                </Btn>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Pedido', 'Cliente', 'Fecha', 'Monto', 'Estado'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium" style={{ color: 'var(--site-primary)' }}>
                        #{o.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 text-sm">{o.customer.name}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-ES') : '—'}</td>
                      <td className="px-5 py-4 text-sm font-medium">${o.total.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            o.status === 'delivered' ? 'success' : o.status === 'shipped' ? 'info' : o.status === 'processing' ? 'warning' : o.status === 'cancelled' ? 'danger' : 'default'
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                        Aún no hay pedidos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'orders' && <div className="mt-6"><OrdersPanel /></div>}
        {activeTab === 'reviews' && <ReviewsManager />}
        {activeTab === 'customers' && <CustomersManager />}
        {activeTab === 'visual' && <VisualManager />}
      </div>
    </div>
  );
}
