import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AgendaPage from './pages/AgendaPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage />
          )
        } 
      />

      {/* Protected routes with Sidebar layout */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route 
          path="/doctors" 
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER']}>
              <DoctorsPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/doctors/:id" 
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER']}>
              <DoctorProfilePage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/patients" 
          element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Pacientes</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          } 
        />
        <Route path="/appointments" element={<AgendaPage />} />
        <Route 
          path="/insurance" 
          element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Obras Sociales</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Pagos</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          } 
        />
      </Route>

      <Route 
        path="*" 
        element={
          <div className="flex items-center justify-center bg-background text-foreground min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground">Page not found</p>
            </div>
          </div>
        } 
      />
    </Routes>
  );
}

export default App;