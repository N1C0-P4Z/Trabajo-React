import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ThemeToggle from './ThemeToggle';

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const {
    siteKey,
    required,
    loading: captchaLoading,
    token: captchaToken,
    canSubmit,
    captchaRef,
  } = useRecaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    if (!canSubmit) {
      return;
    }

    try {
      await login(username, password, captchaToken);
    } catch {
      // el error lo muestra AuthContext
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-card-foreground">Iniciar Sesión</h2>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed -mt-3">
        Ingresa tus credenciales para acceder a tu cuenta
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-card-foreground">Usuario o Email</Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            required
            placeholder="admin o admin@clinica.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
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

        {(required || siteKey) && (
          <div className="flex flex-col items-center gap-2 min-h-[78px]">
            {captchaLoading ? (
              <p className="text-xs text-muted-foreground">Cargando captcha…</p>
            ) : (
              <div ref={captchaRef} />
            )}
            {!captchaLoading && required && !siteKey && (
              <p className="text-xs text-destructive text-center">
                Captcha mal configurado en el servidor (falta RECAPTCHA_SITE_KEY).
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors"
        >
          {loading ? 'Ingresando...' : captchaLoading ? 'Esperando captcha…' : 'Ingresar'}
        </Button>

        <div className="text-center space-y-2 pt-2">
          <p className="text-xs text-muted-foreground">¿No tenés cuenta?</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9 bg-transparent border-border text-card-foreground hover:bg-muted hover:text-card-foreground rounded-xl font-medium transition-colors text-xs"
              onClick={() => navigate('/register')}
            >
              Soy Paciente
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-9 bg-transparent border-border text-card-foreground hover:bg-muted hover:text-card-foreground rounded-xl font-medium transition-colors text-xs"
              onClick={() => navigate('/register-staff')}
            >
              Soy Personal
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
