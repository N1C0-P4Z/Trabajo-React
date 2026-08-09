import React, { useState, useRef } from 'react';
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
import PrivacyPolicy from './PrivacyPolicy';
import { authService, FieldError } from '../services/authService';
import { useRecaptcha } from '../hooks/useRecaptcha';

const OBRA_SOCIAL_OPTIONS = [
  'Ninguna',
  'OSDE',
  'Swiss Medical',
  'Galeno',
  'Medicus',
  'Prevención Salud',
  'Otra',
];

const validatePasswordComplexity = (value) => {
  if (!value) return 'Completá tu contraseña';
  if (value.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(value)) return 'Debe tener al menos una mayúscula';
  if (!/[a-z]/.test(value)) return 'Debe tener al menos una minúscula';
  if (!/[0-9]/.test(value)) return 'Debe tener al menos un número';
  return null;
};

const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const checks = [
    { label: '8+ caracteres', pass: password.length >= 8 },
    { label: 'Una mayúscula', pass: /[A-Z]/.test(password) },
    { label: 'Una minúscula', pass: /[a-z]/.test(password) },
    { label: 'Un número', pass: /[0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;

  return (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1">
        {checks.map((c, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              c.pass ? 'bg-green-500' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map((c, i) => (
          <span
            key={i}
            className={`text-[10px] ${
              c.pass ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {c.pass ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

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
 * Formulario de auto-registro para pacientes.
 * Campos obligatorios: nombre, apellido, usuario, email, teléfono, DNI, contraseña.
 * Campos opcionales: obra social, número de afiliado, contacto de emergencia, alergias, notas.
 * 
 * @returns {JSX.Element}
 */
const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    dni: '',
    obra_social: 'Ninguna',
    numero_afiliado: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    alergias: '',
    notas: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const { siteKey, token: captchaToken, captchaRef } = useRecaptcha();

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
      case 'dni':
        if (!value.trim()) return 'Completá tu DNI';
        if (!/^\d{6,8}$/.test(value.trim())) return 'El DNI debe tener entre 6 y 8 dígitos';
        break;
      case 'telefono_emergencia':
        if (value.trim() && !/^\+?54\s?(?:9\s?)?\d{2,4}\s?\d{4}[\s-]?\d{4}$/.test(value.trim())) return 'Formato inválido. Ej: +54 9 11 1234-5678';
        break;
      case 'password':
        return validatePasswordComplexity(value);
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

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, obra_social: value }));
    setErrors(prev => ({ ...prev, obra_social: null }));

    if (value === 'Ninguna') {
      setFormData(prev => ({ ...prev, numero_afiliado: '' }));
    }
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

    if (!consent) {
      newErrors.consent = 'Debés aceptar la política de privacidad para registrarte';
    }

    if (siteKey && !captchaToken) {
      newErrors.captcha = 'Completá el captcha para continuar';
    }

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
        dni: formData.dni.trim(),
        obra_social: formData.obra_social !== 'Ninguna' ? formData.obra_social : '',
        numero_afiliado: formData.numero_afiliado.trim() || undefined,
        contacto_emergencia: formData.contacto_emergencia.trim() || undefined,
        telefono_emergencia: formData.telefono_emergencia.trim() || undefined,
        alergias: formData.alergias.trim() || undefined,
        notas: formData.notas.trim() || undefined,
        password: formData.password,
        captchaToken: captchaToken || undefined,
        consent: true,
      });

      toast.success('Cuenta creada exitosamente', {
        description: 'Ya podés iniciar sesión con tus credenciales.',
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err instanceof FieldError && err.field) {
        // Error específico de un campo → mostrarlo bajo ese campo
        setErrors(prev => ({ ...prev, [err.field]: err.message }));
      } else {
        // Error general → mostrarlo al final del formulario
        setErrors(prev => ({ ...prev, submit: err.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  const showAffiliate = formData.obra_social !== 'Ninguna';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-card-foreground">Crear Cuenta</h2>
        <ThemeToggle />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed -mt-3">
        Ingresá tus datos para registrarte como paciente
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ──────── DATOS BÁSICOS ──────── */}
        <SectionDivider label="Datos Básicos" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
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

          {/* Apellido */}
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
          {/* Nombre de usuario */}
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

          {/* Email */}
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

        {/* Teléfono */}
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

        {/* ──────── DATOS MÉDICOS ──────── */}
        <SectionDivider label="Datos Médicos" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DNI */}
          <div className="space-y-2">
            <Label htmlFor="dni" className="text-sm font-medium text-card-foreground">
              DNI<ReqAsterisk />
            </Label>
            <Input
              id="dni"
              type="text"
              autoComplete="off"
              placeholder="12345678"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleBlur}
              onClick={moveCursorToEnd}
              disabled={loading}
              className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
            />
            <FieldMessage message={errors.dni} />
          </div>

          {/* Obra Social */}
          <div className="space-y-2">
            <Label htmlFor="obra_social" className="text-sm font-medium text-card-foreground">Obra Social</Label>
            <Select
              value={formData.obra_social}
              onValueChange={handleSelectChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full h-9 bg-input border-border text-foreground rounded-xl">
                <SelectValue placeholder="Seleccioná una obra social" />
              </SelectTrigger>
              <SelectContent>
                {OBRA_SOCIAL_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Número de Afiliado (oculto si obra social es Ninguna) */}
        {showAffiliate && (
          <div className="space-y-2">
            <Label htmlFor="numero_afiliado" className="text-sm font-medium text-card-foreground">Número de Afiliado</Label>
            <Input
              id="numero_afiliado"
              type="text"
              autoComplete="off"
              placeholder="Ej. 123456789"
              value={formData.numero_afiliado}
              onChange={handleChange}
              onClick={moveCursorToEnd}
              disabled={loading}
              className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contacto de Emergencia */}
          <div className="space-y-2">
            <Label htmlFor="contacto_emergencia" className="text-sm font-medium text-card-foreground">Contacto de Emergencia</Label>
            <Input
              id="contacto_emergencia"
              type="text"
              autoComplete="off"
              placeholder="Nombre completo"
              value={formData.contacto_emergencia}
              onChange={handleChange}
              onClick={moveCursorToEnd}
              disabled={loading}
              className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
            />
            <FieldMessage message={errors.contacto_emergencia} />
          </div>

          {/* Teléfono de Emergencia */}
          <div className="space-y-2">
            <Label htmlFor="telefono_emergencia" className="text-sm font-medium text-card-foreground">Teléfono de Emergencia</Label>
            <Input
              id="telefono_emergencia"
              type="tel"
              autoComplete="off"
              placeholder="+54 9 11 1234-5678"
              value={formData.telefono_emergencia}
              onChange={handleChange}
              onBlur={handleBlur}
              onClick={moveCursorToEnd}
              disabled={loading}
              className="h-9 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:ring-ring focus-visible:ring-1"
            />
            <FieldMessage message={errors.telefono_emergencia} />
          </div>
        </div>

        {/* Alergias */}
        <div className="space-y-2">
          <Label htmlFor="alergias" className="text-sm font-medium text-card-foreground">Alergias</Label>
          <textarea
            id="alergias"
            placeholder="Detallá si tenés alguna alergia conocida..."
            value={formData.alergias}
            onChange={handleChange}
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[60px] text-sm"
          />
        </div>

        {/* Notas médicas */}
        <div className="space-y-2">
          <Label htmlFor="notas" className="text-sm font-medium text-card-foreground">Notas médicas</Label>
          <textarea
            id="notas"
            placeholder="Condiciones preexistentes, medicación, etc..."
            value={formData.notas}
            onChange={handleChange}
            disabled={loading}
            rows={3}
            className="w-full px-3 py-2 bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y min-h-[60px] text-sm"
          />
        </div>

        {/* ──────── CREDENCIALES ──────── */}
        <SectionDivider label="Credenciales" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contraseña */}
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
            <PasswordStrength password={formData.password} />
          </div>

          {/* Repetir contraseña */}
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

        {/* Error general del submit */}
        {errors.submit && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl">
            {errors.submit}
          </div>
        )}

        <SectionDivider label="Privacidad" />

        {siteKey && (
          <div className="space-y-2">
            <div className="flex justify-center min-h-[78px]">
              <div ref={captchaRef} />
            </div>
            <FieldMessage message={errors.captcha} />
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
          <p>
            Tus datos se usan solo para la atención odontológica. No se ceden a
            terceros salvo obligación legal. Podés pedir acceso o baja de tus datos
            ante la clínica.{' '}
            <PrivacyPolicy />
          </p>
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (e.target.checked) {
                  setErrors(prev => {
                    const next = { ...prev };
                    delete next.consent;
                    return next;
                  });
                }
              }}
              disabled={loading}
              className="mt-0.5 size-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-card-foreground">
              Acepto la política de privacidad
            </span>
          </label>
          <FieldMessage message={errors.consent} />
        </div>

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
