import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Trash2,
  Loader2,
  Calendar,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrders } from '@/hooks/useOrders';
import { deleteOrder, updateOrderStatus, Order } from '@/lib/firebase';
import { toast } from 'sonner';

const STATUS_OPTIONS: { value: Order['status']; label: string; icon: typeof Clock; color: string }[] = [
  { value: 'pending', label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'processing', label: 'Procesando', icon: PackageCheck, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { value: 'delivered', label: 'Entregado', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
];

function getStatusOption(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
}

export function OrdersPanel() {
  const { orders, loading, error } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<Record<string, string>>({});
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, Order['status']>>({});
  const [updatingOrders, setUpdatingOrders] = useState<Record<string, boolean>>({});

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      try {
        await deleteOrder(id);
        toast.success('Pedido eliminado');
      } catch (error) {
        toast.error('Error al eliminar pedido');
      }
    }
  };

  const handleUpdateStatus = async (order: Order) => {
    const newStatus = selectedStatuses[order.id] || order.status;
    const message = statusMessages[order.id] || '';

    if (!message.trim()) {
      toast.error('Por favor ingresa un mensaje para el cliente');
      return;
    }

    setUpdatingOrders(prev => ({ ...prev, [order.id]: true }));

    try {
      await updateOrderStatus(order.id, newStatus, message, order.userId);
      toast.success('Estado del pedido actualizado');
      setStatusMessages(prev => ({ ...prev, [order.id]: '' }));
      setExpandedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error al actualizar el estado del pedido');
    } finally {
      setUpdatingOrders(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const handlePrint = (order: typeof orders[0]) => {
    const orderDate = order.createdAt?.toDate() || new Date();

    const printContent = `
      <html>
        <head>
          <title>Pedido #${order.id.substring(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #d97706; border-bottom: 3px solid #d97706; padding-bottom: 15px; }
            h2 { color: #d97706; }
            .info-box { background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
            .customer-box { border: 2px solid #d97706; padding: 20px; border-radius: 10px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #d97706; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #ddd; }
            .total { background: #d97706; color: white; padding: 20px; border-radius: 10px; text-align: right; font-size: 24px; }
            .footer { margin-top: 50px; text-align: center; color: #666; border-top: 2px solid #333; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Jorstan Click</h1>
          <h2>COMPROBANTE DE PEDIDO</h2>

          <div class="info-box">
            <p><strong>Pedido #:</strong> ${order.id.substring(0, 8)}</p>
            <p><strong>Fecha:</strong> ${orderDate.toLocaleString('es-ES')}</p>
          </div>

          <div class="customer-box">
            <h3>DATOS DEL CLIENTE</h3>
            <p><strong>Nombre:</strong> ${order.customer.name}</p>
            <p><strong>Teléfono:</strong> ${order.customer.phone}</p>
            <p><strong>Dirección:</strong> ${order.customer.address}</p>
          </div>

          <h3>PRODUCTOS</h3>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.icon || ''} ${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">TOTAL: $${order.total.toFixed(2)}</div>

          <div class="footer">
            <p>Gracias por tu compra!</p>
            <p>Para cualquier consulta, no dudes en contactarnos</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Error al cargar pedidos</h3>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <p className="text-xs text-muted-foreground">
              Verifica la configuración de Firestore y que los índices estén creados correctamente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Pedidos Recibidos ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                No hay pedidos todavía
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {orders.map((order, index) => {
                  const orderDate = order.createdAt?.toDate() || new Date();
                  const currentStatus = getStatusOption(order.status || 'pending');
                  const isExpanded = expandedOrder === order.id;
                  const StatusIcon = currentStatus.icon;

                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group hover:border-primary/30 transition-colors">
                        <CardContent className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono">
                                  #{order.id.substring(0, 8)}
                                </Badge>
                                <Badge className={currentStatus.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {currentStatus.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {orderDate.toLocaleString('es-ES')}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => {
                                  setExpandedOrder(isExpanded ? null : order.id);
                                  if (!selectedStatuses[order.id]) {
                                    setSelectedStatuses(prev => ({ ...prev, [order.id]: order.status || 'pending' }));
                                  }
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                                Estado
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handlePrint(order)}
                              >
                                <Printer className="h-4 w-4" />
                                Imprimir
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(order.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Status Update Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mb-4 p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" />
                                    Actualizar Estado del Pedido
                                  </h4>

                                  {/* Status Selector */}
                                  <div className="mb-3">
                                    <Label className="text-xs text-muted-foreground mb-2 block">Nuevo estado</Label>
                                    <div className="flex flex-wrap gap-2">
                                      {STATUS_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = (selectedStatuses[order.id] || order.status) === opt.value;
                                        return (
                                          <button
                                            key={opt.value}
                                            onClick={() => setSelectedStatuses(prev => ({ ...prev, [order.id]: opt.value }))}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                              isSelected
                                                ? opt.color + ' ring-2 ring-offset-1 ring-current'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-400'
                                            }`}
                                          >
                                            <Icon className="h-3.5 w-3.5" />
                                            {opt.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Message Input */}
                                  <div className="mb-3">
                                    <Label className="text-xs text-muted-foreground mb-2 block">
                                      Mensaje para el cliente
                                    </Label>
                                    <Input
                                      value={statusMessages[order.id] || ''}
                                      onChange={(e) => setStatusMessages(prev => ({ ...prev, [order.id]: e.target.value }))}
                                      placeholder="Ej: Tu pedido está siendo preparado para envío..."
                                      className="text-sm"
                                    />
                                  </div>

                                  {/* Status History */}
                                  {order.statusHistory && order.statusHistory.length > 0 && (
                                    <div className="mb-3">
                                      <Label className="text-xs text-muted-foreground mb-2 block">Historial de estados</Label>
                                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                        {order.statusHistory.map((entry, idx) => {
                                          const entryStatus = getStatusOption(entry.status);
                                          const EntryIcon = entryStatus.icon;
                                          return (
                                            <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded bg-white border">
                                              <EntryIcon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                              <div className="min-w-0">
                                                <span className="font-medium">{entryStatus.label}:</span>{' '}
                                                <span className="text-muted-foreground">{entry.message}</span>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                  {new Date(entry.date).toLocaleString('es-ES')}
                                                </p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* Submit Button */}
                                  <Button
                                    size="sm"
                                    className="w-full gap-2"
                                    onClick={() => handleUpdateStatus(order)}
                                    disabled={updatingOrders[order.id]}
                                  >
                                    {updatingOrders[order.id] ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Send className="h-4 w-4" />
                                    )}
                                    Enviar Actualización al Cliente
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Customer Info */}
                          <div className="grid sm:grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <span className="text-sm">{order.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              <span className="text-sm">{order.customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="text-sm truncate">{order.customer.address}</span>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          {/* Items */}
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <span>
                                  {item.icon} {item.name}
                                  <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                                </span>
                                <span className="font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <Separator className="my-4" />

                          {/* Total */}
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Total del pedido</span>
                            <span className="text-2xl font-bold text-primary">
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
