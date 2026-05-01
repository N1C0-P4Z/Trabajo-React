import React from 'react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Bienvenido, {user?.first_name || user?.username}</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="text-center py-36">
          <p className="text-5xl text-muted-foreground">
            Proximamente... CHUPALA
          </p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;