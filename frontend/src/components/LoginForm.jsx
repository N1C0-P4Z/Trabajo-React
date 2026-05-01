import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ThemeToggle from './ThemeToggle';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await login(username, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-card-foreground">Iniciar Sesión</h2>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed -mt-3">
        Ingresa tus credenciales para acceder a tu cuenta
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email / Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-card-foreground">Usuario o Email</Label>
          <Input
            id="username"
            type="text"
            required
            placeholder="admin o admin@clinica.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Contraseña</Label>
          <Input
            id="password"
            type="password"
            required
            placeholder="secret123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Login button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>

        {/* No tenes cuenta, registrate! */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-9 bg-transparent border-border text-card-foreground hover:bg-muted hover:text-card-foreground rounded-xl font-medium transition-colors"
          onClick={() => window.location.href = '/register'}
        >
          ¿No tenés cuenta? Registrate
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
