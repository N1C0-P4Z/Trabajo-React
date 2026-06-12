import React from 'react';
import { ShieldCheck } from 'lucide-react';

const AdminPage = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mx-auto mb-4">
          <ShieldCheck className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Administración</h1>
        <p className="text-muted-foreground">Panel de administración próximamente.</p>
      </div>
    </div>
  );
};

export default AdminPage;