import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import userService from '../services/userService';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import DentistPhotoUpload from '../components/DentistPhotoUpload';
import { fetchAvatarObjectUrl, revokeAvatarObjectUrl } from '../services/avatarService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Loader2, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// --- Helpers ---

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateNewPassword(password) {
  if (password.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password)) return 'Debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(password)) return 'Debe incluir al menos una minúscula';
  if (!/[0-9]/.test(password)) return 'Debe incluir al menos un número';
  return null;
}

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function formatDateTime(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getStatusLabel(status) {
  const map = {
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmado',
    EN_CURSO: 'En curso',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
    NO_ASISTIO: 'No asistió',
  };
  return map[status] || status;
}

function getStatusVariant(status) {
  const map = {
    PENDIENTE: 'outline',
    CONFIRMADO: 'default',
    EN_CURSO: 'default',
    COMPLETADO: 'secondary',
    CANCELADO: 'secondary',
    NO_ASISTIO: 'secondary',
  };
  return map[status] || 'outline';
}

// --- Component ---

const PatientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dni: '',
    direccion: '',
    obra_social: '',
    numero_afiliado: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    alergias: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // --- Data fetching ---

  const loadPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientService.getById(id);
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadAppointments = useCallback(async (userId) => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError(null);
      // Get a wide date range: past 2 years to future 1 year
      const start = new Date();
      start.setFullYear(start.getFullYear() - 2);
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);
      const data = await appointmentService.getAll(
        start.toISOString(),
        end.toISOString(),
        { patientId: userId }
      );
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAppointmentsError(err.message);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  useEffect(() => {
    if (patient?.user_id) {
      loadAppointments(patient.user_id);
    }
  }, [patient?.user_id, loadAppointments]);

  useEffect(() => {
    let cancelled = false;
    let loadedUrl = null;

    async function loadAvatar() {
      const patientUser = patient?.user;
      const ownProfile = user?.id === patient?.user_id;

      if (ownProfile || !patientUser?.id || !patientUser?.avatar_url) {
        setAvatarObjectUrl((prev) => {
          revokeAvatarObjectUrl(prev);
          return null;
        });
        return;
      }

      const objectUrl = await fetchAvatarObjectUrl(patientUser.id);
      if (cancelled) {
        revokeAvatarObjectUrl(objectUrl);
        return;
      }

      loadedUrl = objectUrl;
      setAvatarObjectUrl((prev) => {
        revokeAvatarObjectUrl(prev);
        return objectUrl;
      });
    }

    if (patient?.user) {
      loadAvatar();
    }

    return () => {
      cancelled = true;
      revokeAvatarObjectUrl(loadedUrl);
    };
  }, [patient?.user?.id, patient?.user?.avatar_url, patient?.user_id, user?.id]);

  useEffect(() => {
    if (patient && user?.id === patient.user_id) {
      setForm((prev) => ({
        ...prev,
        first_name: patient.user?.first_name || '',
        last_name: patient.user?.last_name || '',
        email: patient.user?.email || '',
        phone: patient.user?.phone || '',
        dni: patient.dni || '',
        direccion: patient.direccion || '',
        obra_social: patient.obra_social || '',
        numero_afiliado: patient.numero_afiliado || '',
        contacto_emergencia: patient.contacto_emergencia || '',
        telefono_emergencia: patient.telefono_emergencia || '',
        alergias: patient.alergias || '',
      }));
    }
  }, [patient, user?.id]);

  const handlePhotoUploadSuccess = async () => {
    await refreshUser();
    await loadPatient();
  };

  const isOwnProfile = user?.id === patient?.user_id;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateOwnProfileForm = () => {
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
    if (!form.dni.trim()) {
      errs.dni = 'Completá tu DNI';
    }

    if (passwordOpen || form.new_password || form.current_password || form.confirm_password) {
      if (form.new_password) {
        if (!form.current_password) {
          errs.current_password = 'Ingresá tu contraseña actual';
        }
        const passwordError = validateNewPassword(form.new_password);
        if (passwordError) {
          errs.new_password = passwordError;
        }
        if (form.new_password !== form.confirm_password) {
          errs.confirm_password = 'Las contraseñas no coinciden';
        }
      } else if (form.current_password) {
        errs.new_password = 'Ingresá la nueva contraseña';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveOwnProfile = async (e) => {
    e.preventDefault();
    if (!validateOwnProfileForm()) return;

    setSaving(true);
    try {
      const userData = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      if (form.new_password) {
        userData.current_password = form.current_password;
        userData.new_password = form.new_password;
      }

      await userService.updateUser(user.id, userData);

      await patientService.update(patient.id, {
        dni: form.dni.trim(),
        direccion: form.direccion.trim() || null,
        obra_social: form.obra_social.trim() || null,
        numero_afiliado: form.numero_afiliado.trim() || null,
        contacto_emergencia: form.contacto_emergencia.trim() || null,
        telefono_emergencia: form.telefono_emergencia.trim() || null,
        alergias: form.alergias.trim() || null,
      });

      await refreshUser();
      await loadPatient();

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
      toast.error('Error', { description: err.message || 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
  };

  // --- Self-scoping guard ---

  if (!loading && patient && user?.role === 'PATIENT' && user?.id !== patient.user_id) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
          <svg className="size-8 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Acceso restringido</h2>
        <p className="text-sm text-muted-foreground mb-4">
          No tenés permiso para ver el perfil de otro paciente.
        </p>
        <Button variant="outline" onClick={() => navigate('/patients')}>
          Volver a Pacientes
        </Button>
      </div>
    );
  }

  // DENTIST scope guard — check if this patient has appointments with this dentist
  if (!loading && !appointmentsLoading && patient && user?.role === 'DENTIST') {
    const hasAppointmentWithMe = appointments.some(
      (a) => a.doctor_id === user.id
    );
    if (!hasAppointmentWithMe) {
      return (
        <div className="text-center py-16">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-4">
            <svg className="size-8 text-destructive" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Acceso restringido</h2>
          <p className="text-sm text-muted-foreground mb-4">
            No tenés turnos registrados con este paciente.
          </p>
          <Button variant="outline" onClick={() => navigate('/patients')}>
            Volver a Pacientes
          </Button>
        </div>
      );
    }
  }

  // --- Loading state ---

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground mt-3">Cargando perfil...</p>
      </div>
    );
  }

  // --- Error or not-found state ---

  if (error || !patient) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          {error || 'Paciente no encontrado.'}
        </p>
        <Button variant="outline" onClick={() => navigate('/patients')}>
          Volver a Pacientes
        </Button>
      </div>
    );
  }

  // --- Derived data ---

  const isActive = patient.is_active !== false;
  const firstName = patient.user?.first_name || '';
  const lastName = patient.user?.last_name || '';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/patients">Pacientes</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {firstName} {lastName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            {isOwnProfile ? (
              <DentistPhotoUpload
                user={patient.user}
                onUploadSuccess={handlePhotoUploadSuccess}
                size="md"
              />
            ) : (
              <Avatar size="lg" className="size-20 text-lg">
                {avatarObjectUrl ? (
                  <AvatarImage src={avatarObjectUrl} alt={`${firstName} ${lastName}`} />
                ) : null}
                <AvatarFallback className="text-xl">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {/* Name & DNI */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">
              {firstName} {lastName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              DNI: {patient.dni || '—'}
            </p>
            <div className="mt-3">
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className={
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                    : ''
                }
              >
                {isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/appointments?patientId=${patient.user_id}`)}
            >
              Ver Agenda
            </Button>
            <Button variant="outline" onClick={() => navigate('/patients')}>
              Volver
            </Button>
          </div>
        </div>
      </div>

      {/* Information / Edit */}
      {isOwnProfile ? (
        <form onSubmit={handleSaveOwnProfile} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis datos</CardTitle>
              <CardDescription>Actualizá tu información personal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input id="first_name" name="first_name" value={form.first_name} onChange={handleFormChange} />
                  {formErrors.first_name && <p className="text-sm text-destructive">{formErrors.first_name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input id="last_name" name="last_name" value={form.last_name} onChange={handleFormChange} />
                  {formErrors.last_name && <p className="text-sm text-destructive">{formErrors.last_name}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} />
                {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleFormChange} />
                {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" name="dni" value={form.dni} onChange={handleFormChange} />
                  {formErrors.dni && <p className="text-sm text-destructive">{formErrors.dni}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" name="direccion" value={form.direccion} onChange={handleFormChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="obra_social">Obra Social</Label>
                  <Input id="obra_social" name="obra_social" value={form.obra_social} onChange={handleFormChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numero_afiliado">N° Afiliado</Label>
                  <Input id="numero_afiliado" name="numero_afiliado" value={form.numero_afiliado} onChange={handleFormChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contacto_emergencia">Contacto Emergencia</Label>
                  <Input id="contacto_emergencia" name="contacto_emergencia" value={form.contacto_emergencia} onChange={handleFormChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono_emergencia">Tel. Emergencia</Label>
                  <Input id="telefono_emergencia" name="telefono_emergencia" value={form.telefono_emergencia} onChange={handleFormChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alergias">Alergias</Label>
                <Input id="alergias" name="alergias" value={form.alergias} onChange={handleFormChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
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
                    onChange={handleFormChange}
                  />
                  {formErrors.current_password && (
                    <p className="text-sm text-destructive">{formErrors.current_password}</p>
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
                    onChange={handleFormChange}
                    placeholder="Mínimo 8 caracteres, mayúscula, minúscula y número"
                  />
                  {formErrors.new_password && (
                    <p className="text-sm text-destructive">{formErrors.new_password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleFormChange}
                  />
                  {formErrors.confirm_password && (
                    <p className="text-sm text-destructive">{formErrors.confirm_password}</p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <CardFooter className="px-0">
            <Button type="submit" disabled={saving}>
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
      ) : (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Información</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.user?.email || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Teléfono</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.user?.phone || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">DNI</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.dni || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Dirección</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.direccion || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Obra Social</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.obra_social || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">N° Afiliado</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.numero_afiliado || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Contacto Emergencia</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.contacto_emergencia || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Tel. Emergencia</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.telefono_emergencia || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Alergias</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.alergias || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Notas</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.notas || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Username</dt>
            <dd className="text-sm text-foreground mt-0.5">{patient.user?.username || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Fecha de registro</dt>
            <dd className="text-sm text-foreground mt-0.5">{formatDate(patient.user?.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Última visita</dt>
            <dd className="text-sm text-foreground mt-0.5">{formatDate(patient.last_visit_at)}</dd>
          </div>
        </dl>
      </div>
      )}

      {/* Appointment History Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Historial de Turnos</h2>

        {appointmentsLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground mt-2">Cargando turnos...</p>
          </div>
        )}

        {!appointmentsLoading && appointmentsError && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No se pudieron cargar los turnos.
            </p>
          </div>
        )}

        {!appointmentsLoading && !appointmentsError && appointments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Este paciente no tiene turnos registrados.
            </p>
          </div>
        )}

        {!appointmentsLoading && !appointmentsError && appointments.length > 0 && (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/50 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {formatDateTime(appt.datetime)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dr/a. {appt.doctor?.first_name} {appt.doctor?.last_name}
                    {appt.type?.name && ` — ${appt.type.name}`}
                  </p>
                </div>
                <Badge variant={getStatusVariant(appt.status)} className="shrink-0">
                  {getStatusLabel(appt.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfilePage;