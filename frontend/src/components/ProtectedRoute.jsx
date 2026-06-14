/**
 * @fileoverview Componente que protege rutas que requieren autenticación.
 * Si el usuario no inició sesión, lo redirige al login.
 * Mientras se verifica la sesión muestra un spinner de carga.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Envuelve rutas que solo pueden verse con sesión iniciada.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - El contenido protegido
 * @returns {JSX.Element}
 * 
 * @example
 * <Route element={
 *   <ProtectedRoute>
 *     <DashboardLayout>
 *       <Outlet />
 *     </DashboardLayout>
 *   </ProtectedRoute>
 * }>
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected content
  return children;
};

export default ProtectedRoute;
