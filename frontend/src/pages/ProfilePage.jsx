import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import patientService from '../services/patientService';
import { User } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // PATIENT self-view: redirect to patient profile if possible
    if (user?.role === 'PATIENT' && user?.email) {
      setLoading(true);
      patientService
        .getAll({ search: user.email, limite: 1 })
        .then((result) => {
          const patients = result.data || result || [];
          const match = patients.find(
            (p) => p.user?.email === user.email || p.user_id === user.id
          );
          if (match) {
            navigate(`/patients/${match.id}`, { replace: true });
          }
        })
        .catch(() => {
          // Silently fall back to placeholder
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground mt-3">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md w-full">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mx-auto mb-4">
          <User className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground mb-6">
          La edición de perfil estará disponible próximamente.
        </p>
        {user && (
          <div className="rounded-xl border border-border bg-card p-4 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nombre</span>
              <span className="text-foreground font-medium">{user.first_name} {user.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usuario</span>
              <span className="text-foreground font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rol</span>
              <span className="text-foreground font-medium">{user.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;