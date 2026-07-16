import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, LogOut, CreditCard, Package, Settings, MapPin, Plus, Trash2, Star,
  Loader2, Check, X, Building2, Wallet, Clock, PackageCheck, Truck,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Pencil, Upload, Lock,
  Shield, AlertCircle,
} from 'lucide-react';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  UserProfile,
  PaymentMethod,
  UserOrder,
  Address,
  createOrUpdateUserProfile,
  getUserProfile,
  updateUserProfile,
  addPaymentMethod,
  deletePaymentMethod,
  subscribeToPaymentMethods,
  setDefaultPaymentMethod,
  subscribeToUserOrders,
} from '@/lib/database';
import { Btn } from '@/components/store/Btn';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'addresses' | 'orders' | 'payments' | 'security' | 'settings';

const inputClass = 'w-full bg-background border border-white/8 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-[var(--site-primary)]/40 transition-colors';
const labelClass = 'block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5';

const emptyProfileForm = {
  firstName: '',
  lastName: '',
  phone: '',
  dateOfBirth: '',
  idDocument: '',
  bio: '',
};

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyProfileForm);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'bank' | 'paypal',
    name: '',
    lastFour: '',
    expiryDate: '',
    bankName: '',
    isDefault: false,
  });

  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [addrModal, setAddrModal] = useState<{ open: boolean; data: Partial<Address> }>({ open: false, data: {} });

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isGoogleAccount = user?.providerData[0]?.providerId === 'google.com';

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      let existing = await getUserProfile(user.uid);
      if (!existing) {
        await createOrUpdateUserProfile(user.uid, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
        });
        existing = await getUserProfile(user.uid);
      }
      if (existing) {
        setProfile(existing);
        setForm({
          firstName: existing.firstName || existing.displayName?.split(' ')[0] || '',
          lastName: existing.lastName || existing.displayName?.split(' ').slice(1).join(' ') || '',
          phone: existing.phone || '',
          dateOfBirth: existing.dateOfBirth || '',
          idDocument: existing.idDocument || '',
          bio: existing.bio || '',
        });
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToPaymentMethods(user.uid, setPaymentMethods);
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserOrders(user.uid, setOrders);
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch {
      toast.error('Error al cerrar sesión');
    }
  };

  const initials = `${form.firstName[0] || profile?.email?.[0] || 'U'}${form.lastName[0] || ''}`.toUpperCase();
  const fullName = `${form.firstName} ${form.lastName}`.trim() || profile?.displayName || 'Usuario';

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const displayName = `${form.firstName} ${form.lastName}`.trim();
      await updateUserProfile(user.uid, {
        displayName,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        idDocument: form.idDocument,
        bio: form.bio,
      });
      setProfile((prev) => (prev ? { ...prev, displayName, ...form } : prev));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      toast.success('Perfil actualizado');
    } catch {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!user) return;
    const url = window.prompt('Pega la URL de tu nueva foto de perfil:');
    if (!url) return;
    try {
      await createOrUpdateUserProfile(user.uid, { photoURL: url });
      setProfile((prev) => (prev ? { ...prev, photoURL: url } : prev));
      toast.success('Foto de perfil actualizada');
    } catch {
      toast.error('No se pudo actualizar la foto');
    }
  };

  // ── Direcciones ──
  const addresses = profile?.addresses || [];

  const saveAddresses = async (next: Address[]) => {
    if (!user) return;
    await updateUserProfile(user.uid, { addresses: next });
    setProfile((prev) => (prev ? { ...prev, addresses: next } : prev));
  };

  const handleSaveAddress = async () => {
    if (!addrModal.data.line1?.trim()) return;
    const isNew = !addrModal.data.id;
    let next: Address[];
    if (isNew) {
      next = [...addresses, { ...addrModal.data, id: `addr-${Date.now()}`, isDefault: addresses.length === 0 } as Address];
    } else {
      next = addresses.map((a) => (a.id === addrModal.data.id ? ({ ...a, ...addrModal.data } as Address) : a));
    }
    try {
      await saveAddresses(next);
      setAddrModal({ open: false, data: {} });
      toast.success('Dirección guardada');
    } catch {
      toast.error('No se pudo guardar la dirección');
    }
  };

  const handleRemoveAddress = async (id: string) => {
    try {
      await saveAddresses(addresses.filter((a) => a.id !== id));
    } catch {
      toast.error('No se pudo eliminar la dirección');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await saveAddresses(addresses.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch {
      toast.error('No se pudo actualizar la dirección predeterminada');
    }
  };

  // ── Métodos de pago ──
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
        isDefault: newPaymentMethod.isDefault || paymentMethods.length === 0,
      });
      setNewPaymentMethod({ type: 'card', name: '', lastFour: '', expiryDate: '', bankName: '', isDefault: false });
      setShowAddPayment(false);
      toast.success('Método de pago agregado');
    } catch {
      toast.error('Error al agregar el método de pago');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!user) return;
    try {
      await deletePaymentMethod(user.uid, id);
      toast.success('Método de pago eliminado');
    } catch {
      toast.error('Error al eliminar el método de pago');
    }
  };

  const handleSetDefaultPayment = async (methodId: string) => {
    if (!user) return;
    try {
      await setDefaultPaymentMethod(user.uid, methodId);
      toast.success('Método de pago predeterminado actualizado');
    } catch {
      toast.error('Error al actualizar el método predeterminado');
    }
  };

  // ── Seguridad ──
  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm) return;
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, pwForm.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, pwForm.next);
      setPwForm({ current: '', next: '', confirm: '' });
      toast.success('Contraseña actualizada');
    } catch (error: any) {
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        toast.error('La contraseña actual es incorrecta');
      } else {
        toast.error('No se pudo actualizar la contraseña');
      }
    } finally {
      setPwSaving(false);
    }
  };

  // ── Configuración / notificaciones ──
  const notifPrefs = profile?.notificationPrefs || { email: true, sms: false, marketing: true, twofa: false };

  const toggleNotif = async (key: keyof typeof notifPrefs) => {
    if (!user) return;
    const next = { ...notifPrefs, [key]: !notifPrefs[key] };
    setProfile((prev) => (prev ? { ...prev, notificationPrefs: next } : prev));
    try {
      await updateUserProfile(user.uid, { notificationPrefs: next });
    } catch {
      toast.error('No se pudo guardar la preferencia');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteUser(user);
      toast.success('Cuenta eliminada');
      navigate('/');
    } catch (error: any) {
      if (error?.code === 'auth/requires-recent-login') {
        toast.error('Por seguridad, vuelve a iniciar sesión antes de eliminar tu cuenta');
      } else {
        toast.error('No se pudo eliminar la cuenta');
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirm('');
    }
  };

  const getStatusColor = (status: UserOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/15 text-amber-400';
      case 'processing': return 'bg-blue-500/15 text-blue-400';
      case 'shipped': return 'bg-purple-500/15 text-purple-400';
      case 'delivered': return 'bg-emerald-500/15 text-emerald-400';
      case 'cancelled': return 'bg-red-500/15 text-red-400';
      default: return 'bg-white/8 text-muted-foreground';
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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return PackageCheck;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle2;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: 'var(--site-primary)' }} />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const sidebar: { key: TabType; icon: typeof User; label: string }[] = [
    { key: 'profile', icon: User, label: 'Perfil' },
    { key: 'addresses', icon: MapPin, label: 'Direcciones' },
    { key: 'orders', icon: Package, label: 'Pedidos' },
    { key: 'payments', icon: CreditCard, label: 'Métodos de Pago' },
    { key: 'security', icon: Lock, label: 'Seguridad' },
    { key: 'settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-60 flex-shrink-0">
          <div className="bg-card border border-white/8 rounded-2xl p-4 sticky top-24">
            <div className="flex items-center gap-3 p-3 mb-4 border-b border-white/8 pb-4">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={fullName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{fullName}</p>
                <p className="text-muted-foreground text-xs truncate">{profile?.email || user?.email}</p>
              </div>
            </div>
            <nav className="space-y-0.5">
              {sidebar.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveTab(s.key)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    activeTab === s.key ? '' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                  style={activeTab === s.key ? { background: 'color-mix(in srgb, var(--site-primary) 15%, transparent)', color: 'var(--site-primary)' } : undefined}
                >
                  <s.icon size={15} /> {s.label}
                </button>
              ))}
              <div className="pt-2 mt-2 border-t border-white/8">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/8 transition-colors">
                  <LogOut size={15} /> Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {activeTab === 'profile' && (
            <div className="bg-card border border-white/8 rounded-2xl p-6">
              <h2 className="font-semibold mb-6">Información Personal</h2>
              <div className="flex items-center gap-4 mb-8 p-4 bg-background rounded-2xl border border-white/8">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={fullName} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--site-from), var(--site-to))' }}
                  >
                    {initials}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm mb-1">{fullName}</p>
                  {profile?.createdAt && (
                    <p className="text-muted-foreground text-xs mb-3">
                      Miembro desde {new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <Btn variant="secondary" size="sm" onClick={handleUploadPhoto}>
                    <Upload size={12} /> Cambiar Foto
                  </Btn>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Apellido</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Doe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Correo Electrónico</label>
                  <input value={profile?.email || user?.email || ''} disabled className={cn(inputClass, 'opacity-60 cursor-not-allowed')} />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fecha de Nacimiento</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Documento de Identidad</label>
                  <input value={form.idDocument} onChange={(e) => setForm({ ...form, idDocument: e.target.value })} placeholder="000-00-0000" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} placeholder="Cuéntanos un poco sobre ti…" className={cn(inputClass, 'resize-none')} />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-6">
                <Btn variant="primary" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : 'Guardar Cambios'}
                </Btn>
                {profileSaved && (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <Check size={13} /> Guardado
                  </span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-card border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">Direcciones de Envío</h2>
                <Btn variant="primary" size="sm" onClick={() => setAddrModal({ open: true, data: {} })}>
                  <Plus size={13} /> Agregar Dirección
                </Btn>
              </div>
              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className={cn('p-4 rounded-2xl border transition-colors', a.isDefault ? 'border-[var(--site-primary)]/30' : 'border-white/8 bg-background')} style={a.isDefault ? { background: 'color-mix(in srgb, var(--site-primary) 6%, transparent)' } : undefined}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={13} style={{ color: 'var(--site-primary)' }} />
                        <span className="text-sm font-semibold">{a.label}</span>
                        {a.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400">Predeterminada</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!a.isDefault && (
                          <button onClick={() => handleSetDefaultAddress(a.id)} className="text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--site-primary)' }}>
                            Predeterminar
                          </button>
                        )}
                        <button onClick={() => setAddrModal({ open: true, data: { ...a } })} className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleRemoveAddress(a.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm">{a.name}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{a.line1}, {a.city} {a.zip}</p>
                    <p className="text-muted-foreground text-xs">{a.country}</p>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="text-center py-12">
                    <MapPin size={32} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">No tienes direcciones guardadas</p>
                    <p className="text-muted-foreground text-xs mt-1">Agrega una dirección para agilizar tu checkout</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-card border border-white/8 rounded-2xl p-6">
              <h2 className="font-semibold mb-6">Mis Pedidos</h2>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Aún no tienes pedidos</p>
                  <Link to="/shop">
                    <Btn variant="primary">Explorar Productos</Btn>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div key={order.id} className="p-4 bg-background rounded-xl border border-white/8 hover:border-white/16 transition-colors">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm" style={{ color: 'var(--site-primary)' }}>#{order.id?.slice(-8).toUpperCase()}</span>
                            <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusColor(order.status))}>
                              <StatusIcon size={11} /> {getStatusText(order.status)}
                            </span>
                          </div>
                          <span className="font-bold text-sm">${order.total.toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground text-xs mb-2">{order.date}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {order.items.map((item, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground">
                              {item.name} x{item.quantity}{idx < order.items.length - 1 && ','}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id || null)}
                          className="text-xs flex items-center gap-1 transition-colors"
                          style={{ color: 'var(--site-primary)' }}
                        >
                          {isExpanded ? <>Ocultar <ChevronUp size={13} /></> : <>Ver seguimiento <ChevronDown size={13} /></>}
                        </button>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-white/8">
                            {order.statusHistory && order.statusHistory.length > 0 ? (
                              <div className="relative pl-6">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-white/8" />
                                <div className="space-y-3">
                                  {order.statusHistory.map((entry, idx) => {
                                    const EntryIcon = getStatusIcon(entry.status);
                                    const isLatest = idx === order.statusHistory!.length - 1;
                                    return (
                                      <div key={idx} className="relative flex items-start gap-3">
                                        <div
                                          className="absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center"
                                          style={isLatest ? { background: 'var(--site-primary)', color: 'white' } : undefined}
                                        >
                                          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', !isLatest && 'bg-white/8 text-muted-foreground')}>
                                            <EntryIcon size={13} />
                                          </div>
                                        </div>
                                        <div className="flex-1 p-2.5 rounded-lg bg-white/3 text-xs">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full font-medium', getStatusColor(entry.status as UserOrder['status']))}>
                                              {getStatusText(entry.status as UserOrder['status'])}
                                            </span>
                                            <span className="text-muted-foreground">{new Date(entry.date).toLocaleString('es-ES')}</span>
                                          </div>
                                          <p className="text-muted-foreground">{entry.message}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-xs text-center py-3">Tu pedido está siendo procesado.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="bg-card border border-white/8 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold">Métodos de Pago</h2>
                  <Btn variant="secondary" size="sm" onClick={() => setShowAddPayment((v) => !v)}>
                    <Plus size={13} /> Agregar
                  </Btn>
                </div>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No tienes métodos de pago guardados</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center gap-4 p-4 rounded-2xl border transition-colors"
                        style={method.isDefault ? { borderColor: 'color-mix(in srgb, var(--site-primary) 30%, transparent)', background: 'color-mix(in srgb, var(--site-primary) 5%, transparent)' } : { borderColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                          {method.type === 'card' && <CreditCard size={14} className="text-white/60" />}
                          {method.type === 'bank' && <Building2 size={14} className="text-white/60" />}
                          {method.type === 'paypal' && <Wallet size={14} className="text-white/60" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">
                              {method.name}
                              {method.type === 'card' && method.lastFour && ` •••• ${method.lastFour}`}
                            </p>
                            {method.isDefault && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400">Predeterminado</span>}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {method.type === 'card' && `Expira ${method.expiryDate}`}
                            {method.type === 'bank' && method.bankName}
                            {method.type === 'paypal' && 'PayPal'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!method.isDefault && (
                            <button onClick={() => handleSetDefaultPayment(method.id!)} className="text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap" style={{ color: 'var(--site-primary)' }}>
                              Predeterminar
                            </button>
                          )}
                          <button onClick={() => handleDeletePaymentMethod(method.id!)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showAddPayment && (
                <div className="bg-card border border-[var(--site-primary)]/20 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard size={15} style={{ color: 'var(--site-primary)' }} /> Nuevo Método de Pago
                  </h3>
                  <div className="grid gap-3">
                    <div className="flex gap-2">
                      {[
                        { type: 'card' as const, label: 'Tarjeta', icon: CreditCard },
                        { type: 'bank' as const, label: 'Banco', icon: Building2 },
                        { type: 'paypal' as const, label: 'PayPal', icon: Wallet },
                      ].map((opt) => (
                        <button
                          key={opt.type}
                          onClick={() => setNewPaymentMethod((prev) => ({ ...prev, type: opt.type }))}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm"
                          style={newPaymentMethod.type === opt.type ? { borderColor: 'var(--site-primary)', background: 'color-mix(in srgb, var(--site-primary) 10%, transparent)', color: 'var(--site-primary)' } : { borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          <opt.icon size={14} /> {opt.label}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className={labelClass}>Nombre del Titular</label>
                      <input value={newPaymentMethod.name} onChange={(e) => setNewPaymentMethod((p) => ({ ...p, name: e.target.value }))} placeholder="John Doe" className={inputClass} />
                    </div>
                    {newPaymentMethod.type === 'card' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Últimos 4 dígitos</label>
                          <input value={newPaymentMethod.lastFour} onChange={(e) => setNewPaymentMethod((p) => ({ ...p, lastFour: e.target.value.replace(/\D/g, '').slice(0, 4) }))} placeholder="4242" maxLength={4} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Expiración</label>
                          <input value={newPaymentMethod.expiryDate} onChange={(e) => setNewPaymentMethod((p) => ({ ...p, expiryDate: e.target.value }))} placeholder="MM/YY" maxLength={5} className={inputClass} />
                        </div>
                      </div>
                    )}
                    {newPaymentMethod.type === 'bank' && (
                      <div>
                        <label className={labelClass}>Nombre del Banco</label>
                        <input value={newPaymentMethod.bankName} onChange={(e) => setNewPaymentMethod((p) => ({ ...p, bankName: e.target.value }))} placeholder="Ej: Banco Nacional" className={inputClass} />
                      </div>
                    )}
                    <div className="flex gap-3 mt-1">
                      <Btn variant="secondary" size="sm" onClick={() => setShowAddPayment(false)}>Cancelar</Btn>
                      <Btn variant="primary" size="sm" onClick={handleAddPaymentMethod}>
                        <Lock size={12} /> Guardar Método
                      </Btn>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-card border border-white/8 rounded-2xl p-4 flex items-center gap-3">
                <Shield size={16} className="text-green-400 flex-shrink-0" />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Los pagos con tarjeta se procesan de forma segura por Stripe. Nunca almacenamos tu número de tarjeta completo ni el CVV.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="bg-card border border-white/8 rounded-2xl p-6">
                <h2 className="font-semibold mb-5 flex items-center gap-2">
                  <Lock size={15} style={{ color: 'var(--site-primary)' }} /> Cambiar Contraseña
                </h2>
                {isGoogleAccount ? (
                  <p className="text-muted-foreground text-sm">
                    Iniciaste sesión con Google — la contraseña se gestiona desde tu cuenta de Google, no aquí.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-w-md">
                      <div>
                        <label className={labelClass}>Contraseña Actual</label>
                        <input type="password" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} placeholder="••••••••" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Nueva Contraseña</label>
                        <input type="password" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} placeholder="Mínimo 6 caracteres" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Confirmar Nueva Contraseña</label>
                        <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} placeholder="Repite la nueva contraseña" className={inputClass} />
                      </div>
                      {pwForm.next && pwForm.confirm && pwForm.next !== pwForm.confirm && (
                        <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} /> Las contraseñas no coinciden</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                      <Btn variant="primary" size="sm" onClick={handleChangePassword} disabled={pwSaving || !pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm}>
                        {pwSaving ? <Loader2 size={14} className="animate-spin" /> : 'Actualizar Contraseña'}
                      </Btn>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-card border border-white/8 rounded-2xl p-6">
                <h3 className="font-semibold mb-1">Autenticación de Dos Factores</h3>
                <p className="text-muted-foreground text-sm mb-4">Próximamente: una capa extra de seguridad para tu cuenta.</p>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">Estado: <span className="text-amber-400">No disponible aún</span></p>
                  <Btn variant="secondary" size="sm" disabled>
                    <Shield size={13} /> Próximamente
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-card border border-white/8 rounded-2xl p-6">
                <h2 className="font-semibold mb-5">Notificaciones</h2>
                <div className="space-y-1">
                  {([
                    { key: 'email', label: 'Notificaciones por correo', desc: 'Actualizaciones de pedidos, confirmaciones de envío' },
                    { key: 'sms', label: 'Notificaciones SMS', desc: 'Alertas de entrega por mensaje de texto' },
                    { key: 'marketing', label: 'Correos de marketing', desc: 'Nuevos productos, promociones, ofertas' },
                  ] as { key: keyof typeof notifPrefs; label: string; desc: string }[]).map((n) => (
                    <div key={n.key} className="flex items-center justify-between py-4 border-b border-white/8 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{n.desc}</p>
                      </div>
                      <div
                        onClick={() => toggleNotif(n.key)}
                        className="w-11 h-6 rounded-full relative cursor-pointer transition-colors flex-shrink-0"
                        style={{ background: notifPrefs[n.key] ? 'var(--site-primary)' : 'rgba(255,255,255,0.2)' }}
                      >
                        <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all', notifPrefs[n.key] ? 'right-0.5' : 'left-0.5')} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <h3 className="text-red-400 font-semibold mb-1">Zona de Peligro</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Al eliminar tu cuenta, todos tus datos se eliminarán permanentemente. Esta acción no se puede deshacer.
                </p>
                <Btn variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                  <Trash2 size={13} /> Eliminar Cuenta
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address modal */}
      {addrModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <h3 className="font-semibold">{addrModal.data.id ? 'Editar Dirección' : 'Agregar Dirección'}</h3>
              <button onClick={() => setAddrModal({ open: false, data: {} })} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Etiqueta</label>
                  <input value={addrModal.data.label || ''} onChange={(e) => setAddrModal((m) => ({ ...m, data: { ...m.data, label: e.target.value } }))} placeholder="Casa / Trabajo…" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Nombre Completo</label>
                  <input value={addrModal.data.name || ''} onChange={(e) => setAddrModal((m) => ({ ...m, data: { ...m.data, name: e.target.value } }))} placeholder="John Doe" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Dirección</label>
                <input value={addrModal.data.line1 || ''} onChange={(e) => setAddrModal((m) => ({ ...m, data: { ...m.data, line1: e.target.value } }))} placeholder="Calle Principal 123" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Ciudad</label>
                  <input value={addrModal.data.city || ''} onChange={(e) => setAddrModal((m) => ({ ...m, data: { ...m.data, city: e.target.value } }))} placeholder="Quito" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Código Postal</label>
                  <input value={addrModal.data.zip || ''} onChange={(e) => setAddrModal((m) => ({ ...m, data: { ...m.data, zip: e.target.value } }))} placeholder="170150" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>País</label>
                <input value={addrModal.data.country || 'Ecuador'} onChange={(e) => setAddrModal((m) => ({ ...m, data: { ...m.data, country: e.target.value } }))} className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <Btn variant="secondary" className="flex-1" onClick={() => setAddrModal({ open: false, data: {} })}>Cancelar</Btn>
                <Btn variant="primary" className="flex-1" onClick={handleSaveAddress} disabled={!addrModal.data.line1?.trim()}>Guardar Dirección</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-red-500/20 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <h3 className="font-semibold">Eliminar Cuenta</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Esto eliminará permanentemente tu cuenta. <strong className="text-foreground">Esta acción no se puede deshacer.</strong>
            </p>
            <p className="text-muted-foreground text-xs mb-2">
              Escribe <span className="text-red-400 font-mono">DELETE</span> para confirmar:
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className={cn(inputClass, 'mb-4 border-red-500/20 focus:border-red-500/50')}
            />
            <div className="flex gap-3">
              <Btn variant="secondary" className="flex-1" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancelar</Btn>
              <Btn variant="danger" className="flex-1" disabled={deleteConfirm !== 'DELETE' || deleting} onClick={handleDeleteAccount}>
                {deleting ? <Loader2 size={14} className="animate-spin" /> : 'Eliminar Cuenta'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
