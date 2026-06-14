import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold">Clínica Dental</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Sistema de Gestión Odontológica
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Administrá tu clínica con eficiencia y precisión.
            Desde turnos hasta historias clínicas, todo en un solo lugar.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 0112 15a9 9 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Soy Personal de la Clínica
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary bg-transparent px-8 py-4 text-base font-medium text-primary hover:bg-primary/10 transition-colors shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Soy Paciente
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            ¿Ya sos paciente?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Iniciá sesión acá
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
