/**
 * @fileoverview Componente que protege rutas según el rol del usuario.
 * Además de verificar autenticación, redirige al dashboard si el rol
 * del usuario no está en la lista de roles permitidos.
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * Envuelve rutas que solo pueden verse con ciertos roles.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - El contenido protegido
 * @param {string[]} props.allowedRoles - Lista de roles que pueden acceder
 * @returns {JSX.Element}
 * 
 * @example
 * <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER']}>
 *   <AdminPage />
 * </RoleProtectedRoute>
 */
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
