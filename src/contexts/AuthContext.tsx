import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, checkIsAdmin } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        setAdminLoading(true);
        const adminStatus = await checkIsAdmin(user.uid);
        setIsAdmin(adminStatus);
        setAdminLoading(false);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, adminLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
