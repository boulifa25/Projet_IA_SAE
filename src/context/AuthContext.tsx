import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, ApiError, type UserResponse, type RegisterPayload } from '@/lib/api';

const TOKEN_STORAGE_KEY = 'stageia_token';

interface AuthContextValue {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (payload: RegisterPayload) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    authApi
      .me(storedToken)
      .then((profile) => {
        setToken(storedToken);
        setUser(profile);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const auth = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
      setToken(auth.token);
      setUser(auth.user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Impossible de se connecter.' };
    }
  };

  const signUp = async (payload: RegisterPayload) => {
    try {
      const auth = await authApi.register(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
      setToken(auth.token);
      setUser(auth.user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Impossible de créer le compte.' };
    }
  };

  const signOut = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
