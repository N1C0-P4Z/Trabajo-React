import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold">Clínica Dental</span>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Sistema de Gestión Odontológica
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Administra tu clínica con eficiencia clínica y precisión.
            Desde turnos hasta historias clínicas, todo en un solo lugar.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Empezar Ahora
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
