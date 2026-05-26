import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE } from '@/services/apiConfig';
import appointmentService from '@/services/appointmentService';
import appointmentTypeService from '@/services/appointmentTypeService';
import CalendarGrid from '@/components/CalendarGrid';
import WeekView from '@/components/WeekView';
import DayView from '@/components/DayView';
import AppointmentForm from '@/components/AppointmentForm';

const VIEWS = [
  { key: 'month', label: 'Mes' },
  { key: 'week', label: 'Semana' },
  { key: 'day', label: 'Día' },
];

function getDateRangeForView(date, view) {
  const start = new Date(date);
  const end = new Date(date);

  switch (view) {
    case 'month': {
      // Get first day of month
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      // Get 6-week window to cover calendar grid
      const dayOfWeek = start.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + mondayOffset);

      // End = start + 41 days (6 weeks)
      end.setTime(start.getTime());
      end.setDate(end.getDate() + 41);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'week': {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + mondayOffset);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'day': {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    default:
      break;
  }

  return { start: start.toISOString(), end: end.toISOString() };
}

function navigateDate(date, view, direction) {
  const d = new Date(date);
  switch (view) {
    case 'month':
      d.setMonth(d.getMonth() + direction);
      break;
    case 'week':
      d.setDate(d.getDate() + direction * 7);
      break;
    case 'day':
      d.setDate(d.getDate() + direction);
      break;
  }
  return d;
}

const AgendaPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [appointments, setAppointments] = useState([]);
  const [types, setTypes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Load patients and doctors with role filter
  useEffect(() => {
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
  }, []);

  // Load appointments when date or view changes
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const { start, end } = getDateRangeForView(currentDate, viewMode);
        const data = await appointmentService.getAll(start, end);
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, [currentDate, viewMode]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, viewMode, -1));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => navigateDate(prev, viewMode, 1));
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

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
    appointmentService.getAll(start, end).then(setAppointments).catch(() => {});
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
            appointments={appointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onDayClick={handleDayClick}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        );
      case 'week':
        return (
          <WeekView
            appointments={appointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        );
      case 'day':
        return (
          <DayView
            appointments={appointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg border border-border bg-card p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  viewMode === v.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Today button */}
          <Button variant="outline" size="sm" onClick={handleToday}>
            Hoy
          </Button>
        </div>

        {/* Add button */}
        <Button onClick={handleNewAppointment}>
          + Nuevo turno
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {/* View content */}
      {renderView()}

      {/* Appointment Form Dialog */}
      <AppointmentForm
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSave}
        appointment={editingAppointment}
        types={types}
        patients={patients}
        doctors={doctors}
      />
    </div>
  );
};

export default AgendaPage;
