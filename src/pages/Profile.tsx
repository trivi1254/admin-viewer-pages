import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  CreditCard,
  Package,
  Settings,
  Phone,
  MapPin,
  Mail,
  Plus,
  Trash2,
  Star,
  ChevronRight,
  Loader2,
  Edit2,
  Check,
  X,
  Building2,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  UserProfile,
  PaymentMethod,
  UserOrder,
  createOrUpdateUserProfile,
  getUserProfile,
  updateUserProfile,
  addPaymentMethod,
  deletePaymentMethod,
  subscribeToPaymentMethods,
  setDefaultPaymentMethod,
  subscribeToUserOrders
} from '@/lib/firebase';

type TabType = 'profile' | 'orders' | 'payments' | 'settings';

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  // User profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    displayName: '',
    phone: '',
    address: ''
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'bank' | 'paypal',
    name: '',
    lastFour: '',
    expiryDate: '',
    bankName: '',
    isDefault: false
  });

  // Orders state
  const [orders, setOrders] = useState<UserOrder[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const existingProfile = await getUserProfile(user.uid);
        if (existingProfile) {
          setProfile(existingProfile);
          setEditedProfile({
            displayName: existingProfile.displayName || '',
            phone: existingProfile.phone || '',
            address: existingProfile.address || ''
          });
        } else {
          // Create initial profile
          await createOrUpdateUserProfile(user.uid, {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || undefined
          });
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || undefined
          };
          setProfile(newProfile);
          setEditedProfile({
            displayName: user.displayName || '',
            phone: '',
            address: ''
          });
        }
      }
    };
    loadProfile();
  }, [user]);

  // Subscribe to payment methods
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToPaymentMethods(user.uid, (methods) => {
        setPaymentMethods(methods);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Subscribe to orders
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserOrders(user.uid, (userOrders) => {
        setOrders(userOrders);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile(user.uid, {
        displayName: editedProfile.displayName,
        phone: editedProfile.phone,
        address: editedProfile.address
      });
      setProfile(prev => prev ? {
        ...prev,
        displayName: editedProfile.displayName,
        phone: editedProfile.phone,
        address: editedProfile.address
      } : null);
      setIsEditing(false);
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!user) return;

    if (!newPaymentMethod.name) {
      toast.error('Por favor ingresa el nombre del titular');
      return;
    }

    if (newPaymentMethod.type === 'card' && (!newPaymentMethod.lastFour || !newPaymentMethod.expiryDate)) {
      toast.error('Por favor completa los datos de la tarjeta');
      return;
    }

    if (newPaymentMethod.type === 'bank' && !newPaymentMethod.bankName) {
      toast.error('Por favor ingresa el nombre del banco');
      return;
    }

    try {
      await addPaymentMethod(user.uid, {
        type: newPaymentMethod.type,
        name: newPaymentMethod.name,
        lastFour: newPaymentMethod.type === 'card' ? newPaymentMethod.lastFour : undefined,
        expiryDate: newPaymentMethod.type === 'card' ? newPaymentMethod.expiryDate : undefined,
        bankName: newPaymentMethod.type === 'bank' ? newPaymentMethod.bankName : undefined,
        isDefault: newPaymentMethod.isDefault || paymentMethods.length === 0
      });
      setNewPaymentMethod({
        type: 'card',
        name: '',
        lastFour: '',
        expiryDate: '',
        bankName: '',
        isDefault: false
      });
      setShowAddPayment(false);
      toast.success('Método de pago agregado');
    } catch (error) {
      toast.error('Error al agregar el método de pago');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!user) return;
    try {
      await deletePaymentMethod(user.uid, id);
      toast.success('Método de pago eliminado');
    } catch (error) {
      toast.error('Error al eliminar el método de pago');
    }
  };

  const handleSetDefaultPayment = async (methodId: string) => {
    if (!user) return;
    try {
      await setDefaultPaymentMethod(user.uid, methodId);
      toast.success('Método de pago predeterminado actualizado');
    } catch (error) {
      toast.error('Error al actualizar el método predeterminado');
    }
  };

  const getStatusColor = (status: UserOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: UserOrder['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00d4aa] mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Mi Perfil', icon: User },
    { id: 'orders' as TabType, label: 'Mis Pedidos', icon: Package },
    { id: 'payments' as TabType, label: 'Métodos de Pago', icon: CreditCard },
    { id: 'settings' as TabType, label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      {/* Header */}
      <header className="w-full py-4 px-6 flex items-center justify-between bg-white shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 15L35 30L10 45V15Z" fill="url(#gradProfile)" />
              <path d="M20 20L45 35L20 50V20Z" fill="#00d4aa" fillOpacity="0.7" />
              <path d="M18 28L26 33L18 38V28Z" fill="#00d4aa" />
              <defs>
                <linearGradient id="gradProfile" x1="10" y1="15" x2="35" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1a3a5c" />
                  <stop offset="1" stopColor="#00d4aa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg">
              <span className="text-[#1a3a5c]">Jorstan</span>{" "}
              <span className="text-[#00d4aa]">Click</span>
            </span>
            <span className="text-[10px] text-gray-500">El centro de tus compras rápidas.</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <Link to="/" className="hover:text-[#1a3a5c] transition-colors">Inicio</Link>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Contacto</a>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Categorías</a>
          <a href="#" className="hover:text-[#1a3a5c] transition-colors">Nosotros</a>
          <span className="text-[#00d4aa] font-medium border-b-2 border-[#00d4aa] pb-1">Mi Cuenta</span>
        </nav>

        <Button
          variant="outline"
          className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
              <div className="flex items-center gap-4 mb-6">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Usuario'}
                    className="w-16 h-16 rounded-full border-2 border-[#00d4aa]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#1a3a5c] flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-[#1a3a5c]">
                    {profile?.displayName || user?.displayName || 'Usuario'}
                  </h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-[#00d4aa]/10 text-[#00d4aa]'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </nav>
            </div>

            {/* Logout button for mobile */}
            <Button
              variant="outline"
              className="w-full lg:hidden border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </aside>

          {/* Main Panel */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-[#1a3a5c]">Información Personal</h3>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            setEditedProfile({
                              displayName: profile?.displayName || '',
                              phone: profile?.phone || '',
                              address: profile?.address || ''
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#00d4aa] hover:bg-[#00b894] gap-2"
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Guardar
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-gray-600 flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          Nombre
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.displayName}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                            className="border-gray-300"
                          />
                        ) : (
                          <p className="font-medium text-[#1a3a5c]">{profile?.displayName || 'No especificado'}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-600 flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4" />
                          Correo Electrónico
                        </Label>
                        <p className="font-medium text-[#1a3a5c]">{user?.email}</p>
                      </div>

                      <div>
                        <Label className="text-gray-600 flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4" />
                          Teléfono
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.phone}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Tu número de teléfono"
                            className="border-gray-300"
                          />
                        ) : (
                          <p className="font-medium text-[#1a3a5c]">{profile?.phone || 'No especificado'}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-600 flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4" />
                          Dirección
                        </Label>
                        {isEditing ? (
                          <Input
                            value={editedProfile.address}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Tu dirección de envío"
                            className="border-gray-300"
                          />
                        ) : (
                          <p className="font-medium text-[#1a3a5c]">{profile?.address || 'No especificado'}</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500">
                        Tipo de cuenta: {user?.providerData[0]?.providerId === 'google.com' ? (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                          </span>
                        ) : (
                          <span>Correo y contraseña</span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h3 className="text-xl font-semibold text-[#1a3a5c] mb-6">Mis Pedidos</h3>

                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">Aún no tienes pedidos</p>
                      <Link to="/">
                        <Button className="bg-[#00d4aa] hover:bg-[#00b894]">
                          Explorar Productos
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:border-[#00d4aa] transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-[#1a3a5c]">Pedido #{order.id?.slice(-8).toUpperCase()}</p>
                              <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>

                          <div className="border-t pt-3">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {order.items.map((item, idx) => (
                                <span key={idx} className="text-sm text-gray-600">
                                  {item.name} x{item.quantity}
                                  {idx < order.items.length - 1 && ','}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[#1a3a5c]">
                                Total: ${order.total.toLocaleString()}
                              </p>
                              <Button variant="ghost" size="sm" className="text-[#00d4aa]">
                                Ver Detalles
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payments' && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-[#1a3a5c]">Métodos de Pago</h3>
                    <Button
                      className="bg-[#00d4aa] hover:bg-[#00b894] gap-2"
                      onClick={() => setShowAddPayment(true)}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button>
                  </div>

                  {/* Add Payment Form */}
                  <AnimatePresence>
                    {showAddPayment && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 border rounded-lg bg-gray-50"
                      >
                        <h4 className="font-medium text-[#1a3a5c] mb-4">Nuevo Método de Pago</h4>

                        <div className="grid gap-4">
                          <div>
                            <Label className="mb-2 block">Tipo</Label>
                            <div className="flex gap-2">
                              {[
                                { type: 'card' as const, label: 'Tarjeta', icon: CreditCard },
                                { type: 'bank' as const, label: 'Banco', icon: Building2 },
                                { type: 'paypal' as const, label: 'PayPal', icon: Wallet }
                              ].map((opt) => (
                                <button
                                  key={opt.type}
                                  onClick={() => setNewPaymentMethod(prev => ({ ...prev, type: opt.type }))}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    newPaymentMethod.type === opt.type
                                      ? 'border-[#00d4aa] bg-[#00d4aa]/10 text-[#00d4aa]'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  <opt.icon className="w-4 h-4" />
                                  {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="mb-2 block">Nombre del Titular</Label>
                            <Input
                              value={newPaymentMethod.name}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre como aparece en la tarjeta/cuenta"
                            />
                          </div>

                          {newPaymentMethod.type === 'card' && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <Label className="mb-2 block">Últimos 4 dígitos</Label>
                                <Input
                                  value={newPaymentMethod.lastFour}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, lastFour: e.target.value.slice(0, 4) }))}
                                  placeholder="1234"
                                  maxLength={4}
                                />
                              </div>
                              <div>
                                <Label className="mb-2 block">Fecha de Expiración</Label>
                                <Input
                                  value={newPaymentMethod.expiryDate}
                                  onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                />
                              </div>
                            </div>
                          )}

                          {newPaymentMethod.type === 'bank' && (
                            <div>
                              <Label className="mb-2 block">Nombre del Banco</Label>
                              <Input
                                value={newPaymentMethod.bankName}
                                onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, bankName: e.target.value }))}
                                placeholder="Ej: Banco Nacional"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={newPaymentMethod.isDefault}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isDefault" className="cursor-pointer">
                              Establecer como método predeterminado
                            </Label>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setShowAddPayment(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              className="bg-[#00d4aa] hover:bg-[#00b894]"
                              onClick={handleAddPaymentMethod}
                            >
                              Guardar
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment Methods List */}
                  {paymentMethods.length === 0 && !showAddPayment ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No tienes métodos de pago guardados</p>
                      <Button
                        className="bg-[#00d4aa] hover:bg-[#00b894] gap-2"
                        onClick={() => setShowAddPayment(true)}
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Método de Pago
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border rounded-lg p-4 flex items-center justify-between ${
                            method.isDefault ? 'border-[#00d4aa] bg-[#00d4aa]/5' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {method.type === 'card' && <CreditCard className="w-8 h-8 text-[#1a3a5c]" />}
                            {method.type === 'bank' && <Building2 className="w-8 h-8 text-[#1a3a5c]" />}
                            {method.type === 'paypal' && <Wallet className="w-8 h-8 text-[#1a3a5c]" />}
                            <div>
                              <p className="font-medium text-[#1a3a5c]">
                                {method.name}
                                {method.isDefault && (
                                  <Badge className="ml-2 bg-[#00d4aa] text-white">
                                    <Star className="w-3 h-3 mr-1" />
                                    Predeterminado
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                {method.type === 'card' && `**** ${method.lastFour} - Exp: ${method.expiryDate}`}
                                {method.type === 'bank' && method.bankName}
                                {method.type === 'paypal' && 'PayPal'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!method.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultPayment(method.id!)}
                                className="text-[#00d4aa]"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePaymentMethod(method.id!)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h3 className="text-xl font-semibold text-[#1a3a5c] mb-6">Configuración de Cuenta</h3>

                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-[#1a3a5c] mb-2">Sesión</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Gestiona tu sesión actual en este dispositivo.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium text-[#1a3a5c] mb-2">Notificaciones</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Configura las notificaciones de tu cuenta.
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                          <span className="text-sm">Notificaciones de pedidos</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                          <span className="text-sm">Ofertas y promociones</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm">Novedades de productos</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h4 className="font-medium text-red-700 mb-2">Zona de Peligro</h4>
                      <p className="text-sm text-red-600 mb-4">
                        Estas acciones son permanentes y no se pueden deshacer.
                      </p>
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-100"
                        onClick={() => toast.info('Esta función estará disponible próximamente')}
                      >
                        Eliminar mi cuenta
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 bg-[#2d3748]">
        <p>© 2026 Jorstan Click. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
