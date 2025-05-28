import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from './api';
import { UserRole, type User, ApprovalStatus } from './auth';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  userRole: UserRole;
  isApproved: boolean;
  profileComplete: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkProfileStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.DONOR);
  const [isApproved, setIsApproved] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
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
            
            // Set approval status
            setIsApproved(res.data.user.approvalStatus === ApprovalStatus.APPROVED || res.data.user.role === UserRole.DONOR);
            
            // Set profile completion status
            setProfileComplete(res.data.user.profileComplete || false);
            
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
  }, []);  const login = (userData: User, token: string) => {
    setUser(userData);
    setToken(token);
    setIsLoggedIn(true);
    
    // Set user role based on user data
    if (userData && userData.role) {
      setUserRole(userData.role as UserRole);
    }
    
    // Set approval status
    setIsApproved(userData.approvalStatus === ApprovalStatus.APPROVED || userData.role === UserRole.DONOR);
    
    // Set profile completion status
    setProfileComplete(userData.profileComplete || false);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    setIsApproved(false);
    setProfileComplete(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const checkProfileStatus = async () => {
    try {
      const { data } = await api.get('/auth/profile-status');
      setProfileComplete(data.profileComplete);
      if (user) {
        const updatedUser = { ...user, profileComplete: data.profileComplete };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to check profile status:', error);
    }
  };
  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><span>Loading...</span></div>;
  }
  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      token, 
      userRole, 
      isApproved, 
      profileComplete, 
      login, 
      logout, 
      checkProfileStatus 
    }}>
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
