import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User, Phone, MapPin, Trash2, Loader2, Calendar, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOrders } from '@/hooks/useOrders';
import { deleteOrder } from '@/lib/firebase';
import { toast } from 'sonner';

export function OrdersPanel() {
  const { orders, loading, error } = useOrders();

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
          <h1>🛍️ URBAN SHOP</h1>
          <h2>COMPROBANTE DE PEDIDO</h2>
          
          <div class="info-box">
            <p><strong>Pedido #:</strong> ${order.id.substring(0, 8)}</p>
            <p><strong>Fecha:</strong> ${orderDate.toLocaleString('es-ES')}</p>
          </div>

          <div class="customer-box">
            <h3>📍 DATOS DEL CLIENTE</h3>
            <p><strong>Nombre:</strong> ${order.customer.name}</p>
            <p><strong>Teléfono:</strong> ${order.customer.phone}</p>
            <p><strong>Dirección:</strong> ${order.customer.address}</p>
          </div>

          <h3>🛒 PRODUCTOS</h3>
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
                  <td>${item.icon} ${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">TOTAL: $${order.total.toFixed(2)}</div>

          <div class="footer">
            <p>¡Gracias por tu compra! 🎉</p>
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
                                <Badge className="bg-success text-success-foreground">
                                  Nuevo
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
