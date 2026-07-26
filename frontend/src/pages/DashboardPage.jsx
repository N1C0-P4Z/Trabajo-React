import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import appointmentService from '../services/appointmentService';
import statsService from '../services/statsService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays, Stethoscope, Users, Clock,
  ArrowRight, Plus, Loader2
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatTime = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const statusLabel = (status) => {
  const map = {
    PENDIENTE: 'Pendiente',
    CONFIRMADO: 'Confirmado',
    CANCELADO: 'Cancelado',
    COMPLETADO: 'Completado',
    NO_ASISTIO: 'No asistió',
  };
  return map[status] || status;
};

const statusVariant = (status) => {
  const map = {
    PENDIENTE: 'outline',
    CONFIRMADO: 'default',
    CANCELADO: 'destructive',
    COMPLETADO: 'secondary',
    NO_ASISTIO: 'destructive',
  };
  return map[status] || 'outline';
};

// ---------------------------------------------------------------------------
// AppointmentCard
// ---------------------------------------------------------------------------

const AppointmentCard = ({ appointment }) => (
  <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
    <div>
      <p className="text-sm font-medium text-foreground">
        {formatTime(appointment.datetime)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {appointment.patient?.first_name} {appointment.patient?.last_name}
        {appointment.doctor && ` — Dr/a. ${appointment.doctor.first_name} ${appointment.doctor.last_name}`}
      </p>
    </div>
    <Badge variant={statusVariant(appointment.status)} className="shrink-0">
      {statusLabel(appointment.status)}
    </Badge>
  </div>
);

// ---------------------------------------------------------------------------
// Loading / Error / Empty shared shells
// ---------------------------------------------------------------------------

const LoadingShell = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <Loader2 className="size-6 animate-spin mb-2" />
    <p className="text-sm">{label}</p>
  </div>
);

const ErrorShell = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <p className="text-sm text-destructive mb-3">{message}</p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
);

// ---------------------------------------------------------------------------
// PatientDashboard
// ---------------------------------------------------------------------------

const PatientDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeMonths = new Date(today);
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      const data = await appointmentService.getMyAppointments(
        today.toISOString(),
        threeMonths.toISOString()
      );
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hola, {user.first_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tus próximos turnos
          </p>
        </div>
        <Button
          size="lg"
          className="px-8 py-6 text-lg font-semibold gap-2"
          onClick={() => navigate('/appointments?action=new')}
        >
          <Plus className="size-6" />
          Sacar turno
        </Button>
      </div>

      {loading && <LoadingShell label="Cargando tus turnos..." />}
      {error && <ErrorShell message="No se pudieron cargar tus turnos" onRetry={load} />}
      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-16">
          <CalendarDays className="size-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">
            No tenés turnos programados. ¡Sacá uno nuevo!
          </p>
          <Button
            size="lg"
            className="px-8 py-6 text-lg font-semibold gap-2"
            onClick={() => navigate('/appointments?action=new')}
          >
            <Plus className="size-6" />
            Sacar turno
          </Button>
        </div>
      )}
      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-2">
          {appointments.slice(0, 5).map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
          {appointments.length > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={() => navigate('/appointments')}
            >
              Ver todos los turnos <ArrowRight className="size-4 ml-1" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// DentistDashboard
// ---------------------------------------------------------------------------

const DentistDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const data = await appointmentService.getAll(
        today.toISOString(),
        todayEnd.toISOString(),
        { doctorId: user.id }
      );
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Hola, Dr/a. {user.last_name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Turnos de hoy
        </p>
      </div>

      {loading && <LoadingShell label="Cargando turnos de hoy..." />}
      {error && <ErrorShell message="No se pudieron cargar los turnos" onRetry={load} />}
      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-16">
          <Stethoscope className="size-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            No tenés turnos para hoy. ¡Qué descanso!
          </p>
        </div>
      )}
      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <Button
          variant="default"
          className="w-full py-5 text-base font-semibold"
          onClick={() => navigate('/appointments')}
        >
          Ver agenda completa <ArrowRight className="size-5 ml-1.5" />
        </Button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// SecretaryDashboard
// ---------------------------------------------------------------------------

const SecretaryDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const data = await appointmentService.getAll(
        today.toISOString(),
        todayEnd.toISOString()
      );
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Turnos del día de hoy
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            size="default"
            className="px-6 py-5 text-base font-semibold"
            onClick={() => navigate('/appointments')}
          >
            <Plus className="size-5 mr-2" />
            Nuevo turno
          </Button>
          <Button
            size="default"
            variant="outline"
            className="px-6 py-5 text-base font-semibold"
            onClick={() => navigate('/patients')}
          >
            <Users className="size-5 mr-2" />
            Pacientes
          </Button>
        </div>
      </div>

      {loading && <LoadingShell label="Cargando turnos..." />}
      {error && <ErrorShell message="No se pudieron cargar los turnos" onRetry={load} />}
      {!loading && !error && appointments.length === 0 && (
        <div className="text-center py-16">
          <CalendarDays className="size-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No hay turnos para hoy</p>
        </div>
      )}
      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-2">
          {appointments.map((apt) => (
            <AppointmentCard key={apt.id} appointment={apt} />
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// AdminDashboard
// ---------------------------------------------------------------------------

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = stats
    ? [
        { icon: Users, label: 'Pacientes', value: stats.totalPatients ?? 0 },
        { icon: Stethoscope, label: 'Dentistas', value: stats.totalDoctors ?? 0 },
        { icon: CalendarDays, label: 'Turnos hoy', value: stats.todayAppointments ?? 0 },
        { icon: Clock, label: 'Pendientes', value: stats.pendingAppointments ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vista general del sistema
        </p>
      </div>

      {loading && <LoadingShell label="Cargando estadísticas..." />}
      {error && <ErrorShell message="No se pudieron cargar las estadísticas" onRetry={load} />}
      {!loading && !error && stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label}>
                <CardHeader>
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-2xl">{kpi.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <kpi.icon className="size-5 text-muted-foreground/50" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            variant="default"
            className="w-full py-5 text-base font-semibold"
            onClick={() => navigate('/admin')}
          >
            Ir al Panel de Administración <ArrowRight className="size-5 ml-1.5" />
          </Button>
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// DashboardPage — main router
// ---------------------------------------------------------------------------

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'PATIENT':
      return <PatientDashboard user={user} />;
    case 'DENTIST':
      return <DentistDashboard user={user} />;
    case 'SECRETARY':
      return <SecretaryDashboard />;
    case 'SUPER_ADMIN':
    case 'OWNER':
      return <AdminDashboard />;
    default:
      return <AdminDashboard />;
  }
};

export default DashboardPage;
