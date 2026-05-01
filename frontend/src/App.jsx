import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

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
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/doctors" 
        element={
          <ProtectedRoute>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Doctores</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Pacientes</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Citas</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/insurance" 
        element={
          <ProtectedRoute>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Obras Sociales</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payments" 
        element={
          <ProtectedRoute>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground mb-2">Pagos</h1>
                <p className="text-muted-foreground">Próximamente...</p>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
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