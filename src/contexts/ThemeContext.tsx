import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SiteTheme {
  name: string;
  label: string;
  primary: string;
}

export const SITE_THEMES: SiteTheme[] = [
  { name: 'blue', label: 'Azul', primary: '#3B82F6' },
  { name: 'purple', label: 'Púrpura', primary: '#8B5CF6' },
  { name: 'emerald', label: 'Esmeralda', primary: '#10B981' },
  { name: 'amber', label: 'Ámbar', primary: '#F59E0B' },
  { name: 'rose', label: 'Rosa', primary: '#F43F5E' },
];

interface ThemeContextType {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'site-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return SITE_THEMES.find((t) => t.name === saved) || SITE_THEMES[0];
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-site-theme', theme.name);
    localStorage.setItem(STORAGE_KEY, theme.name);
  }, [theme]);

  const setTheme = (t: SiteTheme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useSiteTheme must be used within a ThemeProvider');
  }
  return context;
}
