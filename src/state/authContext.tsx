import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from './api';
import { UserRole } from './auth';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any;
  token: string | null;
  userRole: UserRole;
  login: (user: any, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.DONOR);
  const [loading, setLoading] = useState(true);

  useEffect(() => {    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          const res = await api.post('/auth/check-token', {}, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data && res.data.user) {
            setToken(storedToken);
            setUser(res.data.user);
            setIsLoggedIn(true);
            
            // Set user role based on user data
            if (res.data.user && res.data.user.role) {
              setUserRole(res.data.user.role as UserRole);
            }
            
            localStorage.setItem('user', JSON.stringify(res.data.user));
          } else {
            setUser(null);
            setToken(null);
            setIsLoggedIn(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          }
        } catch {
          setUser(null);
          setToken(null);
          setIsLoggedIn(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      }
      setLoading(false);
    };
    checkToken();
    // eslint-disable-next-line
  }, []);
  const login = (user: any, token: string) => {
    setUser(user);
    setToken(token);
    setIsLoggedIn(true);
    
    // Set user role based on user data
    if (user && user.role) {
      setUserRole(user.role as UserRole);
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span>Loading...</span></div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const useUserRole = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useUserRole must be used within an AuthProvider');
  return context.userRole;
};
