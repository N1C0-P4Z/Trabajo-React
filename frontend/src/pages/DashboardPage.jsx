import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import ThemeToggle from '../components/ThemeToggle';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        <div className="text-center">

          <p className="mt-1 text-4xl font-extrabold text-foreground sm:text-5xl sm:tracking-tight lg:text-6xl">
            ¡CHUPALA, {user?.username}!
          </p>

          <p className="mt-8 max-w-xl mx-auto text-xl text-muted-foreground">
            Te has autenticado exitosamente usando JWT tokens almacenados en cookies httpOnly.
          </p>

          <div className="mt-8 flex justify-center space-x-4 text-sm text-muted-foreground">
            <span>✓ Autenticación segura</span>
            <span>✓ Cookies httpOnly</span>
            <span>✓ Rutas protegidas</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
