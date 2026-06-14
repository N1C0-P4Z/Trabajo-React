/**
 * @fileoverview Contexto de autenticación de la aplicación.
 * Proporciona el estado del usuario, funciones de login/logout y un flag de carga
 * a toda la app. Envuelve la aplicación en {@link AuthProvider} y se consume con
 * el hook {@link useAuth}.
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Proveedor del contexto de autenticación.
 * Al montarse verifica si hay una sesión activa en el servidor (cookie).
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Los componentes hijos que tendrán acceso al contexto
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    setLoading(true);

    try {
      const userData = await authService.login(username, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if server logout fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  // isAuthenticated helper
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated(user);
  }, [user]);

  const value = {
    user,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
