import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import patientService from '../services/patientService';
import appointmentService from '../services/appointmentService';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// --- Helpers ---

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
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

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
          <Avatar size="lg" className="size-20 text-lg">
            <AvatarFallback className="text-xl">
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>

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

      {/* Information Grid */}
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