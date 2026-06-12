import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

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