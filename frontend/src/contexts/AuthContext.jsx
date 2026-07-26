/**
 * @fileoverview Contexto de autenticación de la aplicación.
 * Proporciona el estado del usuario, funciones de login/logout y un flag de carga
 * a toda la app. Envuelve la aplicación en {@link AuthProvider} y se consume con
 * el hook {@link useAuth}.
 */

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

const ADMIN_ROLES = ['SUPER_ADMIN', 'OWNER'];
const DEV_ROLE_STORAGE_KEY = 'dev_simulated_role';
const DEV_USER_ID_STORAGE_KEY = 'dev_simulated_user_id';

function readDevSimulation() {
  if (!import.meta.env.DEV) {
    return { role: null, userId: null };
  }

  const role = sessionStorage.getItem(DEV_ROLE_STORAGE_KEY);
  const userIdRaw = sessionStorage.getItem(DEV_USER_ID_STORAGE_KEY);

  return {
    role: role || null,
    userId: userIdRaw ? Number(userIdRaw) : null,
  };
}

function clearDevSimulationStorage() {
  sessionStorage.removeItem(DEV_ROLE_STORAGE_KEY);
  sessionStorage.removeItem(DEV_USER_ID_STORAGE_KEY);
}

function persistDevSimulation(role, userId) {
  if (!import.meta.env.DEV) return;

  if (!role) {
    clearDevSimulationStorage();
    return;
  }

  sessionStorage.setItem(DEV_ROLE_STORAGE_KEY, role);
  if (userId) {
    sessionStorage.setItem(DEV_USER_ID_STORAGE_KEY, String(userId));
  } else {
    sessionStorage.removeItem(DEV_USER_ID_STORAGE_KEY);
  }
}

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
  const [simulatedRole, setSimulatedRoleState] = useState(() => readDevSimulation().role);
  const [simulatedUserId, setSimulatedUserIdState] = useState(() => readDevSimulation().userId);

  const canSimulateRoles = Boolean(
    import.meta.env.DEV && user && ADMIN_ROLES.includes(user.role)
  );

  const effectiveUser = useMemo(() => {
    if (!user) return null;
    if (!canSimulateRoles || !simulatedRole) return user;

    const overridden = { ...user, role: simulatedRole };
    if (simulatedRole === 'DENTIST' && simulatedUserId) {
      overridden.id = simulatedUserId;
    }
    return overridden;
  }, [user, canSimulateRoles, simulatedRole, simulatedUserId]);

  const setSimulatedRole = useCallback((role, userId = null) => {
    if (!import.meta.env.DEV) return;

    setSimulatedRoleState(role);
    setSimulatedUserIdState(userId);
    persistDevSimulation(role, userId);
  }, []);

  const clearRoleSimulation = useCallback(() => {
    setSimulatedRoleState(null);
    setSimulatedUserIdState(null);
    clearDevSimulationStorage();
  }, []);

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
      clearRoleSimulation();
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if server logout fails
      setUser(null);
      clearRoleSimulation();
    } finally {
      setLoading(false);
    }
  }, [clearRoleSimulation]);

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
    user: effectiveUser,
    realUser: user,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    loading,
    error,
    setError,
    canSimulateRoles,
    simulatedRole,
    simulatedUserId,
    setSimulatedRole,
    clearRoleSimulation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
