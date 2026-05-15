import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('contentSuite_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('contentSuite_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    const userData = {
      id: response.user.id,
      email: response.user.email,
      full_name: response.user.full_name,
      role: response.user.role,
    };
    setUser(userData);
    localStorage.setItem('contentSuite_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (email, password, full_name, role) => {
    const response = await authAPI.register(email, password, full_name, role);
    const userData = {
      id: response.user.id,
      email: response.user.email,
      full_name: response.user.full_name,
      role: response.user.role,
    };
    setUser(userData);
    localStorage.setItem('contentSuite_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('contentSuite_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
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