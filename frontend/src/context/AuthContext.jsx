import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const AuthContext = createContext(null);

const BASE_URL = (import.meta.env.VITE_API_URL || 'https://kadai-connect.onrender.com').replace(/\/$/, '');

// Silent ping to wake Render free-tier instance before user interacts
const pingBackend = () => {
  fetch(`${BASE_URL}/api/ping/`, { method: 'GET' }).catch(() => {});
};

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  // 'waking' = first ping in flight | 'ok' = server responded | 'down' = unreachable
  const [backendStatus, setBackendStatus] = useState('waking');
  const wakeStartRef = useRef(Date.now());
  const apiCache = useRef({});

  // Periodic cache cleanup to prevent memory leaks
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.keys(apiCache.current).forEach(key => {
        if (now - apiCache.current[key].timestamp > 60000) {
          delete apiCache.current[key];
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Wake up the Render backend on mount
  React.useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    fetch(`${BASE_URL}/api/ping/`, { method: 'GET', signal: controller.signal })
      .then(() => setBackendStatus('ok'))
      .catch(() => {
        // Try one more time after 5s (Render can take up to 30s to spin up)
        setTimeout(() => {
          fetch(`${BASE_URL}/api/ping/`, { method: 'GET' })
            .then(() => setBackendStatus('ok'))
            .catch(() => setBackendStatus('down'));
        }, 5000);
      })
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

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

  const updateUser = useCallback((newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('kc_session', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const apiFetch = useCallback(async (url, options = {}, _retry = true) => {
    const method = options.method || 'GET';
    const isGet = method.toUpperCase() === 'GET';

    // Invalidate entire cache on write operations (POST, PUT, PATCH, DELETE)
    if (!isGet) {
      apiCache.current = {};
    } else {
      // Check cache for GET requests
      const cached = apiCache.current[url];
      if (cached && (Date.now() - cached.timestamp < 30000)) { // 30s cache TTL
        return cached.response.clone();
      }
    }

    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    try {
      const response = await fetch(fullUrl, { ...options, headers });

      // Server is alive — mark it
      if (backendStatus !== 'ok') setBackendStatus('ok');

      if (response.status === 401) {
        logout();
        return response;
      }

      // Cache successful GET responses
      if (isGet && response.ok) {
        apiCache.current[url] = {
          response: response.clone(),
          timestamp: Date.now()
        };
      }

      return response;
    } catch (e) {
      // Network error — likely Render cold-start (ERR_CONNECTION_CLOSED)
      if (_retry) {
        console.warn('apiFetch: network error, retrying in 4s…', e.message);
        setBackendStatus('waking');
        await new Promise(r => setTimeout(r, 4000));
        return apiFetch(url, options, false); // one retry
      }
      console.error('apiFetch: network error after retry:', e);
      setBackendStatus('down');
      return {
        ok: false,
        status: 503,
        json: async () => ({ detail: 'Server is unavailable. Please try again in a moment.' }),
        text: async () => 'Service Unavailable'
      };
    }
  }, [token, backendStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, apiFetch, backendStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
