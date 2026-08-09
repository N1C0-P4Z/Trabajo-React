import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import patientService from '../services/patientService';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, Lock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import DentistPhotoUpload from '../components/DentistPhotoUpload';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({});

  // PATIENT redirect
  useEffect(() => {
    if (user?.role === 'PATIENT' && user?.email) {
      setLoading(true);
      patientService
        .getAll({ search: user.email, limite: 1 })
        .then((result) => {
          const patients = result.data || result || [];
          const match = patients.find(
            (p) => p.user?.email === user.email || p.user_id === user.id
          );
          if (match) {
            navigate(`/patients/${match.id}`, { replace: true });
          }
        })
        .catch(() => {
          // Silently fall back to placeholder
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, navigate]);

  // Populate form when user loads
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};

    if (!form.first_name.trim() || form.first_name.trim().length < 2) {
      errs.first_name = 'Mínimo 2 caracteres';
    }
    if (!form.last_name.trim() || form.last_name.trim().length < 2) {
      errs.last_name = 'Mínimo 2 caracteres';
    }
    if (!form.email.trim()) {
      errs.email = 'Completá tu correo electrónico';
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = 'Formato de email inválido';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Completá tu teléfono';
    } else if (!form.phone.trim().startsWith('+54')) {
      errs.phone = 'Formato argentino: +54 ...';
    }

    // Password validation (only if user opened the section)
    if (passwordOpen || form.new_password || form.current_password || form.confirm_password) {
      if (form.new_password) {
        if (!form.current_password) {
          errs.current_password = 'Ingresá tu contraseña actual';
        }
        if (form.new_password.length < 6) {
          errs.new_password = 'Mínimo 6 caracteres';
        }
        if (form.new_password !== form.confirm_password) {
          errs.confirm_password = 'Las contraseñas no coinciden';
        }
      } else if (form.current_password) {
        errs.new_password = 'Ingresá la nueva contraseña';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSaving(true);

    try {
      const data = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      // Only send password fields if user is changing password
      if (form.new_password) {
        data.current_password = form.current_password;
        data.new_password = form.new_password;
      }

      await userService.updateUser(user.id, data);
      await refreshUser();

      // Reset password fields
      setForm((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
      setPasswordOpen(false);

      toast.success('Perfil actualizado', {
        description: 'Tus datos se guardaron correctamente.',
      });
    } catch (err) {
      const msg = err.message || 'Error al guardar los cambios';
      setError(msg);
      toast.error('Error', { description: msg });
    } finally {
      setSaving(false);
    }
  };

  // PATIENT loading redirect spinner
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground mt-3">Redirigiendo...</p>
      </div>
    );
  }

  // PATIENT role shows nothing extra (redirect handled above)
  if (user?.role === 'PATIENT') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md w-full">
          <div className="flex items-center justify-center size-16 rounded-full bg-primary/10 mx-auto mb-4">
            <User className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Redirigiendo a tu perfil de paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Editá tus datos personales y contraseña
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {/* Dentist photo upload */}
      {user?.role === 'DENTIST' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Foto de perfil
            </CardTitle>
            <CardDescription>
              Tu foto será visible para pacientes y personal de la clínica
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DentistPhotoUpload user={user} onUploadSuccess={refreshUser} />
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5" />
              Datos personales
            </CardTitle>
            <CardDescription>
              Información básica de tu cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+54 9 11 1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card className="mt-4">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setPasswordOpen(!passwordOpen)}
          >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="size-5" />
                  Cambiar contraseña
                </CardTitle>
                <CardDescription>
                  {passwordOpen
                    ? 'Ingresá tu contraseña actual y la nueva'
                    : 'Hacé clic para cambiar tu contraseña'}
                </CardDescription>
              </div>
              {passwordOpen ? (
                <ChevronUp className="size-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>

          {passwordOpen && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Contraseña actual</Label>
                <Input
                  id="current_password"
                  name="current_password"
                  type="password"
                  value={form.current_password}
                  onChange={handleChange}
                  placeholder="Ingresá tu contraseña actual"
                />
                {errors.current_password && (
                  <p className="text-sm text-destructive">{errors.current_password}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="new_password">Nueva contraseña</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  value={form.new_password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                />
                {errors.new_password && (
                  <p className="text-sm text-destructive">{errors.new_password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repetí la nueva contraseña"
                />
                {errors.confirm_password && (
                  <p className="text-sm text-destructive">{errors.confirm_password}</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <CardFooter className="mt-4 px-0">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default ProfilePage;
