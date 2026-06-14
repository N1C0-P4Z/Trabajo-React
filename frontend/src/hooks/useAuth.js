/**
 * @fileoverview Hook personalizado para acceder al contexto de autenticación.
 * Abstrae el useContext para que los componentes no tengan que importar
 * el contexto manualmente.
 */

import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Devuelve el estado de autenticación actual.
 * Debe usarse dentro de un componente envuelto por {@link AuthProvider}.
 * 
 * @returns {{
 *   user: Object|null,
 *   login: (username: string, password: string) => Promise<Object>,
 *   logout: () => Promise<void>,
 *   refreshUser: () => Promise<void>,
 *   isAuthenticated: () => boolean,
 *   loading: boolean,
 *   error: string|null,
 *   setError: (error: string|null) => void
 * }}
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * if (isAuthenticated()) {
 *   console.log(`Hola ${user.first_name}`);
 * }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default useAuth;
