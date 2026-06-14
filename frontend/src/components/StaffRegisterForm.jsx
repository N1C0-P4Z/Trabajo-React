/**
 * @fileoverview Formulario de registro público para personal de la clínica
 * (dentistas y secretarios/as). A diferencia del registro de pacientes, no
 * pide datos médicos (sin obra social, DNI, alergias, etc.).
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';
import { authService, FieldError } from '../services/authService';

const ROLE_OPTIONS = [
  { value: 'DENTIST', label: 'Dentista' },
  { value: 'SECRETARY', label: 'Secretario/a' },
];

const moveCursorToEnd = (e) => {
  const input = e.target;
  setTimeout(() => {
    input.selectionStart = input.selectionEnd = input.value.length;
  }, 0);
};

const SectionDivider = ({ label }) => (
  <div className="relative py-2 mt-2">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center text-xs">
      <span className="px-3 bg-card text-muted-foreground font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
  </div>
);

const ReqAsterisk = () => (
  <span className="text-destructive ml-0.5">*</span>
);

const FieldMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-xl">
      {message}
    </div>
  );
};

/**
 * Formulario de auto-registro para personal de la clínica.
 * Permite elegir entre rol Dentista o Secretario/a.
 * Solo pide datos básicos: nombre, apellido, usuario, email, teléfono y contraseña.
 * 
 * @returns {JSX.Element}
 */
const StaffRegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    role: 'DENTIST',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'first_name':
        if (!value.trim()) return 'Completá tu nombre';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        break;
      case 'last_name':
        if (!value.trim()) return 'Completá tu apellido';
        if (value.trim().length < 2) return 'Mínimo 2 caracteres';
        break;
      case 'username':
        if (!value.trim()) return 'Completá tu nombre de usuario';
        if (value.trim().length < 3) return 'Mínimo 3 caracteres';
        if (!/^[a-zA-Z0-9_.-]+$/.test(value.trim())) return 'Solo letras, números, puntos y guiones';
        break;
      case 'email':
        if (!value.trim()) return 'Completá tu correo electrónico';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'El formato del email no es válido';
        break;
      case 'phone':
        if (!value.trim()) return 'Completá tu teléfono';
        if (!/^\+?54\s?(?:9\s?)?\d{2,4}\s?\d{4}[\s-]?\d{4}$/.test(value.trim())) return 'Formato inválido. Ej: +54 9 11 1234-5678';
        break;
      case 'password':
        if (!value) return 'Completá tu contraseña';
        if (value.length < 6) return 'Mínimo 6 caracteres';
        break;
      case 'confirmPassword':
        if (!value) return 'Repetí tu contraseña';
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

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    const fieldError = validateField(id, value);
    setErrors(prev => ({ ...prev, [id]: fieldError }));
  };

  const clearFieldErrors = () => {
    setErrors(prev => {
      const next = { ...prev };
      delete next.submit;
      return next;
    });
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

    clearFieldErrors();
    setLoading(true);

    try {
      await authService.register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        password: formData.password
      });

      toast.success('Cuenta creada exitosamente', {
        description: 'Ya podés iniciar sesión con tus credenciales.',
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err instanceof FieldError && err.field) {
        setErrors(prev => ({ ...prev, [err.field]: err.message }));
      } else {
        setErrors(prev => ({ ...prev, submit: err.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-card-foreground">Crear Cuenta - Personal</h2>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed -mt-3">
        Ingresá tus datos para registrarte como personal de la clínica
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionDivider label="Datos Básicos" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium text-card-foreground">
              Nombre<ReqAsterisk />
            </Label>
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
            <FieldMessage message={errors.first_name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-card-foreground">
              Apellido<ReqAsterisk />
            </Label>
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
            <FieldMessage message={errors.last_name} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-card-foreground">
              Nombre de usuario<ReqAsterisk />
            </Label>
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
            <FieldMessage message={errors.username} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
              Correo electrónico<ReqAsterisk />
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="off"
              placeholder="juan@gmail.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={loading}
              className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
            />
            <FieldMessage message={errors.email} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-card-foreground">
              Teléfono<ReqAsterisk />
            </Label>
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
            <FieldMessage message={errors.phone} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-card-foreground">
              Rol<ReqAsterisk />
            </Label>
            <Select
              value={formData.role}
              onValueChange={handleRoleChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-9 bg-input border-border text-foreground rounded-xl">
                <SelectValue placeholder="Seleccioná un rol" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <SectionDivider label="Credenciales" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-card-foreground">
              Contraseña<ReqAsterisk />
            </Label>
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
            <FieldMessage message={errors.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-card-foreground">
              Repetir contraseña<ReqAsterisk />
            </Label>
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
            <FieldMessage message={errors.confirmPassword} />
          </div>
        </div>

        {errors.submit && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {errors.submit}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors"
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

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

export default StaffRegisterForm;
