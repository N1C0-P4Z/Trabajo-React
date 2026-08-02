/**
 * @fileoverview Formulario de inicio de sesión con usuario/email y contraseña.
 * Incluye reCAPTCHA v2. Al hacer submit llama al contexto de autenticación
 * y redirige al dashboard. Ofrece links para registrarse como paciente o personal.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ThemeToggle from './ThemeToggle';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/**
 * Formulario de inicio de sesión con reCAPTCHA v2.
 * Llama a login() del AuthContext con usuario/email, contraseña y captcha token.
 * Muestra errores y estado de carga, y redirige al dashboard al iniciar sesión.
 * 
 * @returns {JSX.Element}
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);
  const captchaWidgetId = useRef(null);
  const { login, loading, error } = useAuth();

  // Load reCAPTCHA script and render widget
  const renderCaptcha = useCallback(() => {
    if (!RECAPTCHA_SITE_KEY || !captchaRef.current || !window.grecaptcha) return;
    // Reset if already rendered
    if (captchaWidgetId.current !== null) {
      try {
        window.grecaptcha.reset(captchaWidgetId.current);
      } catch {
        // Widget may not be initialized yet
      }
      return;
    }
    captchaWidgetId.current = window.grecaptcha.render(captchaRef.current, {
      sitekey: RECAPTCHA_SITE_KEY,
      callback: (token) => setCaptchaToken(token),
      'expired-callback': () => setCaptchaToken(null),
      'error-callback': () => setCaptchaToken(null),
    });
  }, []);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    // If script already loaded
    if (window.grecaptcha && window.grecaptcha.render) {
      renderCaptcha();
      return;
    }

    // Load script dynamically
    const existingScript = document.querySelector(
      'script[src="https://www.google.com/recaptcha/api.js"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', renderCaptcha);
      return () => existingScript.removeEventListener('load', renderCaptcha);
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderCaptcha);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', renderCaptcha);
  }, [renderCaptcha]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await login(username, password, captchaToken);
    } catch {
      // Error handled by AuthContext (shows toast/error message)
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
            autoComplete="username"
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

        {/* reCAPTCHA v2 widget */}
        {RECAPTCHA_SITE_KEY && (
          <div className="flex justify-center">
            <div ref={captchaRef} />
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
