import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from './api';
import { fetchDonorByUserId } from './donors';
import { UserRole, type User, ApprovalStatus } from './auth';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  userRole: UserRole;
  isApproved: boolean;
  profileComplete: boolean;
  login: (user: User, token: string) => Promise<void>;
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

  // Function to fetch and set donor profile for donor users
  const fetchAndSetDonorProfile = async (userData: User) => {
    if (userData.role === UserRole.DONOR && !userData.donorProfile) {
      try {
        const donorData = await fetchDonorByUserId(userData._id);
        if (donorData) {
          const updatedUser = { ...userData, donorProfile: donorData._id };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        }
      } catch (error) {
        console.error('Failed to fetch donor profile:', error);
      }
    }
    return userData;
  };

  useEffect(() => {    const checkToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedToken && storedUser) {
        try {
          const res = await api.post('/auth/check-token', {}, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });          if (res.data && res.data.user) {
            setToken(storedToken);
            const userData = res.data.user;
            
            // Fetch donor profile if user is a donor
            const updatedUser = await fetchAndSetDonorProfile(userData);
            setUser(updatedUser);
            setIsLoggedIn(true);
              // Set user role based on user data
            if (updatedUser && updatedUser.role) {
              setUserRole(updatedUser.role as UserRole);
            }
            
            // Set approval status
            setIsApproved(updatedUser.approvalStatus === ApprovalStatus.APPROVED || updatedUser.role === UserRole.DONOR);
            
            // Set profile completion status
            setProfileComplete(updatedUser.profileComplete || false);
            
            localStorage.setItem('user', JSON.stringify(updatedUser));
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
  }, []);  const login = async (userData: User, token: string) => {
    // Fetch donor profile if user is a donor
    const updatedUser = await fetchAndSetDonorProfile(userData);
    
    setUser(updatedUser);
    setToken(token);
    setIsLoggedIn(true);
    
    // Set user role based on user data
    if (updatedUser && updatedUser.role) {
      setUserRole(updatedUser.role as UserRole);
    }
    
    // Set approval status
    setIsApproved(updatedUser.approvalStatus === ApprovalStatus.APPROVED || updatedUser.role === UserRole.DONOR);
    
    // Set profile completion status
    setProfileComplete(updatedUser.profileComplete || false);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(updatedUser));
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
