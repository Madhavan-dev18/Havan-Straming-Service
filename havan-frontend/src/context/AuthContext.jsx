import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const API = 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_data');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ── login ─────────────────────────────────
  const login = async (username, password) => {
    const res = await fetch(`${API}/login/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed.');
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const userData = { username };
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  // ── register ──────────────────────────────
  const register = async (formData) => {
    const res = await fetch(`${API}/register/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      const firstError = Object.values(err)[0];
      throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
    }
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const userData = { username: formData.username };
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  // ── logout ────────────────────────────────
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // ── authenticated fetch (auto attaches JWT + optional extra headers) ──
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    return fetch(url, { ...options, headers });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}