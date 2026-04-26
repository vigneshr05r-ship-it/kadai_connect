import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  React.useEffect(() => {
    try {
      const sessStr = localStorage.getItem('kc_session');
      const tokenStr = localStorage.getItem('kc_token');
      
      const sess = sessStr && sessStr !== 'undefined' && sessStr !== 'null' ? JSON.parse(sessStr) : null;
      const t = tokenStr && tokenStr !== 'undefined' && tokenStr !== 'null' ? tokenStr : null;

      if (sess && t) {
        setUser(sess);
        setToken(t);
      } else {
        // Clear anything partial or corrupt
        localStorage.removeItem('kc_session');
        localStorage.removeItem('kc_token');
      }
    } catch (e) {
      console.error('Auth hydration error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken) => {
    if (!accessToken || accessToken === 'undefined' || accessToken === 'null') {
      console.error('Refusing to login with invalid token:', accessToken);
      return;
    }
    const data = { ...userData, loginTime: Date.now() };
    setUser(data);
    setToken(accessToken);
    localStorage.setItem('kc_token', accessToken);
    localStorage.setItem('kc_session', JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kc_session');
    localStorage.removeItem('kc_token');
  };

  const apiFetch = async (url, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...options.headers,
    };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const BASE_URL = import.meta.env.VITE_API_URL || '';
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    try {
      const response = await fetch(fullUrl, { ...options, headers });
      
      if (response.status === 401) {
        logout();
        return response;
      }

      return response;
    } catch (e) {
      console.error('Network error in apiFetch:', e);
      // Return a fake response object that behaves like a failed fetch
      return {
        ok: false,
        status: 503,
        json: async () => ({ detail: 'Service Unavailable' }),
        text: async () => 'Service Unavailable'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
