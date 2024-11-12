import { Navigate, useLocation } from 'react-router-dom';
import { z } from 'zod';

import { AuthResponse, User } from '@/types/api';

import { api } from './api-client';
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AxiosError } from 'axios';

// api call definitions for auth (types, schemas, requests):
// these are not part of features as this is a module shared across features

const getUser = async () => {
  const response: AuthResponse = await api.get('/auth/me');

  return response.data;
};

export const loginInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(5, 'Required')
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const registerInputSchema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required')
});

export type RegisterInput = z.infer<typeof registerInputSchema>;

interface AuthFnResponse {
  ok: boolean;
  error?: string;
}

interface AuthCtx {
  user: User | null;
  login: (data: LoginInput) => Promise<AuthFnResponse>;
  register: (data: RegisterInput) => Promise<AuthFnResponse>;
  logout: () => Promise<AuthFnResponse>;
  loading: boolean;
}

const AuthContext = React.createContext<AuthCtx>({} as AuthCtx);

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        setUser(user);
      } catch (error) {
        console.error('error', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = React.useCallback(
    async (data: LoginInput) => {
      setLoading(true);
      try {
        const res: AuthResponse = await api.post('/auth/login', data);
        setUser(res.data);
        return { ok: true };
      } catch (error) {
        console.error('error', error);
        if (error instanceof AxiosError) {
          return { ok: false, error: error.response?.data.message };
        }

        return { ok: false, error: 'Invalid username or password' };
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  const register = React.useCallback(
    async (data: RegisterInput) => {
      setLoading(true);
      try {
        const res: AuthResponse = await api.post('/auth/register', data);
        setUser(res.data);
        return { ok: true };
      } catch (error) {
        console.error('error', error);
        if (error instanceof AxiosError) {
          return { ok: false, error: error.response?.data.message };
        }
        return { ok: false, error: 'An error occured' };
      } finally {
        setLoading(false);
      }
    },
    [setUser]
  );

  const logout = React.useCallback(async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      return { ok: true };
    } catch (error) {
      console.error('error', error);
      if (error instanceof AxiosError) {
        return { ok: false, error: error.response?.data.message };
      }
      return { ok: false, error: 'An error occured' };
    }
  }, [setUser]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useUser = () => {
  const { user } = useAuth();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  return user;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!user && !loading) {
    return (
      <Navigate
        to={`/?redirectTo=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return children;
};
