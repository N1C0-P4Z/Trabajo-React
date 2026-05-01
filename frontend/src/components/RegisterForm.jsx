import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ThemeToggle from './ThemeToggle';
import userService from '../services/userService';

const moveCursorToEnd = (e) => {
  const input = e.target;
  setTimeout(() => {
    input.selectionStart = input.selectionEnd = input.value.length;
  }, 0);
};

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        break;
      case 'last_name':
        if (!value.trim()) return 'El apellido es requerido';
        if (value.trim().length < 2) return 'El apellido debe tener al menos 2 caracteres';
        break;
      case 'username':
        if (!value.trim()) return 'El nombre de usuario es requerido';
        if (value.trim().length < 3) return 'El nombre de usuario debe tener al menos 3 caracteres';
        if (!/^[a-zA-Z0-9_.-]+$/.test(value.trim())) return 'Solo letras, números, puntos, guiones y guiones bajos';
        break;
      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Formato de email inválido';
        break;
      case 'phone':
        if (!value.trim()) return 'El teléfono es requerido';
        if (!/^\+?54\s?(?:9\s?)?\d{2,4}\s?\d{4}[\s-]?\d{4}$/.test(value.trim())) return 'Formato argentino inválido. Ej: +54 9 11 1234-5678';
        break;
      case 'password':
        if (!value) return 'La contraseña es requerida';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'confirmPassword':
        if (!value) return 'Debes repetir la contraseña';
        if (value !== formData.password) return 'Las contraseñas no coinciden';
        break;
      default:
        return null;
    }
    return null;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    const fieldError = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: fieldError }));
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    const fieldError = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await userService.register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      navigate('/login');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-card-foreground">Crear Cuenta</h2>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed -mt-3">
        Ingresa tus datos para registrarte
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="first_name" className="text-sm font-medium text-card-foreground">Nombre</Label>
          <Input
            id="first_name"
            type="text"
            autoComplete="off"
            placeholder="Juan"
            value={formData.first_name}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.first_name && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.first_name}</div>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="last_name" className="text-sm font-medium text-card-foreground">Apellido</Label>
          <Input
            id="last_name"
            type="text"
            autoComplete="off"
            placeholder="Pérez"
            value={formData.last_name}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.last_name && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.last_name}</div>
          )}
        </div>

        {/* Nombre de usuario */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-card-foreground">Nombre de usuario</Label>
          <Input
            id="username"
            type="text"
            autoComplete="off"
            placeholder="juanperez"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.username && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.username}</div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-card-foreground">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="off"
            placeholder="juan@gmail.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.email && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.email}</div>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-card-foreground">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="off"
            placeholder="+54 9 11 1234-5678"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.phone && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.phone}</div>
          )}
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-card-foreground">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="off"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.password && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.password}</div>
          )}
        </div>

        {/* Repetir contraseña */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">Repetir contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="off"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            onClick={moveCursorToEnd}
            disabled={loading}
            className="h-9 bg-input border-border text-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
          />
          {errors.confirmPassword && (
            <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">{errors.confirmPassword}</div>
          )}
        </div>

        {/* Error submit (errores del backend) */}
        {errors.submit && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {errors.submit}
          </div>
        )}

        {/* Register button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors"
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

        {/* Already have account */}
        <div className="text-center text-sm text-muted-foreground">
          ¿Ya tenés cuenta?{' '}
          <Link 
            to="/login" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Iniciá Sesión
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;