import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterStaffPage from './pages/RegisterStaffPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import AgendaPage from './pages/AgendaPage';
import DoctorsPage from './pages/DoctorsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import PatientsPage from './pages/PatientsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import ProfilePage from './pages/ProfilePage';
import PaymentsPage from './pages/PaymentsPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const { isAuthenticated, user } = useAuth();

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
        path="/register-staff" 
        element={
          isAuthenticated() ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterStaffPage />
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER']}>
              <AdminPage />
            </RoleProtectedRoute>
          }
        />
        <Route 
          path="/dentists" 
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER', 'SECRETARY']}>
              <DoctorsPage />
            </RoleProtectedRoute>
          } 
        />
        <Route 
          path="/dentists/:id" 
          element={
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER', 'SECRETARY']}>
              <DoctorProfilePage />
            </RoleProtectedRoute>
          } 
        />
        <Route path="/patients" element={
          <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER', 'SECRETARY', 'DENTIST']}>
            <PatientsPage />
          </RoleProtectedRoute>
        } />
        <Route path="/patients/:id" element={
          <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER', 'SECRETARY', 'DENTIST', 'PATIENT']}>
            <PatientProfilePage />
          </RoleProtectedRoute>
        } />
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
            <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'OWNER', 'SECRETARY']}>
              <PaymentsPage />
            </RoleProtectedRoute>
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