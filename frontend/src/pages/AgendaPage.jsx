import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDateRangeForView, navigateDate, formatWeekRange } from '@/lib/dateUtils';
import { API_BASE } from '@/services/apiConfig';
import { useAuth } from '@/hooks/useAuth';
import appointmentService from '@/services/appointmentService';
import appointmentTypeService from '@/services/appointmentTypeService';
import CalendarGrid from '@/components/CalendarGrid';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import AppointmentForm from '@/components/AppointmentForm';
import ResumenPanel from '@/components/ResumenPanel';

// Locally defined — also used by WeekView; extracted here to avoid circular dependency
function getWeekDays(date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const VIEWS = [
  { key: 'month', label: 'Mes' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Día' },
];

const AgendaPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [appointments, setAppointments] = useState([]);
  const [types, setTypes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const doctorFromUrl = searchParams.get('doctorId');
  const isPatient = user?.role === 'PATIENT';
  const isDentist = user?.role === 'DENTIST';
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    isDentist ? String(user.id) : (doctorFromUrl || 'all')
  );

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [prefilledDate, setPrefilledDate] = useState(null);

  // Load appointment types on mount
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const typesData = await appointmentTypeService.getAll();
        setTypes(typesData);
      } catch (err) {
        console.error('Failed to load types:', err);
      }
    };
    loadTypes();
  }, []);

  // Load patients and doctors (only if not PATIENT — they don't need to create appointments)
  useEffect(() => {
    if (isPatient) return;

    const loadUsers = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          fetch(`${API_BASE}/v1/users?role=PATIENT`, { credentials: 'include' }),
          fetch(`${API_BASE}/v1/users?role=DENTIST`, { credentials: 'include' }),
        ]);

        if (patientsRes.ok) setPatients(await patientsRes.json());
        if (doctorsRes.ok) setDoctors(await doctorsRes.json());
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, [isPatient]);

  // Load appointments when date or view changes — PATIENT uses /me, others use /all
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const { start, end } = getDateRangeForView(currentDate, viewMode);

        let data;
        if (isPatient) {
          data = await appointmentService.getMyAppointments(start, end);
        } else if (isDentist) {
          data = await appointmentService.getAll(start, end, { doctorId: user.id });
        } else {
          data = await appointmentService.getAll(start, end);
        }
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, [currentDate, viewMode, isPatient, isDentist, user?.id]);

  // Filter appointments by selected doctor (PATIENT always sees only their own)
  const filteredAppointments = useMemo(() => {
    if (isPatient) return appointments;
    if (selectedDoctorId === 'all') return appointments;
    return appointments.filter((a) => String(a.doctor_id) === selectedDoctorId);
  }, [appointments, selectedDoctorId, isPatient]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, viewMode, -1));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, viewMode, 1));
  }, [viewMode]);

  const handleDayClick = useCallback((date) => {
    setCurrentDate(date);
    setViewMode('day');
  }, []);

  const handleSlotClick = useCallback((date) => {
    setEditingAppointment(null);
    setPrefilledDate(date);
    setDialogOpen(true);
  }, []);

  const handleAppointmentClick = useCallback((appointment) => {
    setEditingAppointment(appointment);
    setPrefilledDate(null);
    setDialogOpen(true);
  }, []);

  const handleNewAppointment = useCallback(() => {
    setEditingAppointment(null);
    setPrefilledDate(null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setEditingAppointment(null);
    setPrefilledDate(null);
  }, []);

  const handleSave = useCallback(() => {
    // Reload appointments from current range
    const { start, end } = getDateRangeForView(currentDate, viewMode);
    if (isPatient) {
      appointmentService.getMyAppointments(start, end).then(setAppointments).catch(() => {});
    } else {
      appointmentService.getAll(start, end).then(setAppointments).catch(() => {});
    }
  }, [currentDate, viewMode, isPatient]);

  // Heading label based on viewMode
  const currentLabel = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return capitalize(
          currentDate.toLocaleDateString('es-AR', {
            month: 'long',
            year: 'numeric',
          })
        );
      case 'week': {
        const days = getWeekDays(currentDate);
        return formatWeekRange(days);
      }
      case 'day':
        return capitalize(
          currentDate.toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })
        );
      default:
        return '';
    }
  }, [currentDate, viewMode]);

  const renderView = () => {
    if (loading && appointments.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          Cargando turnos...
        </div>
      );
    }

    switch (viewMode) {
      case 'month':
        return (
          <CalendarGrid
            appointments={filteredAppointments}
            currentDate={currentDate}
            onDayClick={handleDayClick}
          />
        );
      case 'week':
        return (
          <WeekView
            appointments={filteredAppointments}
            currentDate={currentDate}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      case 'day':
        return (
          <DayView
            appointments={filteredAppointments}
            currentDate={currentDate}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Chevron navigation */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={handlePrev}
                className="px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border-r border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Heading */}
            <h2 className="text-lg font-semibold text-foreground">
              {currentLabel}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Doctor filter — hidden for PATIENT */}
            {!isPatient && (
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos los doctores" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom">
                  <SelectItem value="all">Todos los doctores</SelectItem>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={String(doc.id)}>
                      Dr/a. {doc.first_name} {doc.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* View toggle — segmented control */}
            <div className="flex bg-muted p-0.5 rounded-lg">
              {VIEWS.map((v) => (
                <button
                  key={v.key}
                  onClick={() => {
                    setViewMode(v.key);
                    setCurrentDate(new Date());
                  }}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    viewMode === v.key
                      ? 'bg-card shadow-sm text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Add button — hidden for PATIENT */}
            {!isPatient && (
              <button
                onClick={handleNewAppointment}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                + Nuevo turno
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
            {error}
          </div>
        )}

        {/* View content — fills remaining height */}
        <div className="flex-1 min-h-0">
          {renderView()}
        </div>

        {/* Appointment Form Dialog — hidden for PATIENT */}
        {!isPatient && (
          <AppointmentForm
            open={dialogOpen}
            onClose={handleDialogClose}
            onSave={handleSave}
            appointment={editingAppointment}
            types={types}
            patients={patients}
            doctors={doctors}
            appointments={filteredAppointments}
            doctorId={selectedDoctorId}
          />
        )}
      </div>

      {/* Sidebar — Resumen Panel */}
      <aside className="hidden lg:flex flex-col w-80 flex-shrink-0">
        <ResumenPanel appointments={filteredAppointments} viewMode={viewMode} />
      </aside>
    </div>
  );
};

export default AgendaPage;