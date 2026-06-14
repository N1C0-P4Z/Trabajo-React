import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import appointmentService from '@/services/appointmentService';
import TimeSlotPicker from '@/components/TimeSlotPicker';

const statusOptions = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADO', label: 'Confirmado' },
  { value: 'EN_CURSO', label: 'En curso' },
  { value: 'COMPLETADO', label: 'Completado' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'NO_ASISTIO', label: 'No asistió' },
];

function toLocalDateString(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateFromISO(isoStr) {
  if (!isoStr) return undefined;
  const [datePart] = isoStr.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function parseTimeFromISO(isoStr) {
  if (!isoStr) return '';
  const [, timePart] = isoStr.split('T');
  if (!timePart) return '';
  return timePart.substring(0, 5);
}

const AppointmentForm = ({
  open,
  onClose,
  onSave,
  appointment,
  types,
  patients,
  doctors,
  appointments = [],
  doctorId = 'all',
  selfPatientId = null,
}) => {
  const isEditing = !!appointment;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [patientId, setPatientId] = useState('');
  const [formDoctorId, setFormDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [typeId, setTypeId] = useState('');
  const [status, setStatus] = useState('PENDIENTE');
  const [notes, setNotes] = useState('');
  const [obraSocial, setObraSocial] = useState('');

  // Populate form when editing or reset for new
  useEffect(() => {
    if (appointment) {
      setPatientId(String(appointment.patient_id));
      setFormDoctorId(String(appointment.doctor_id));
      setSelectedDate(parseDateFromISO(appointment.datetime));
      setTimeStr(parseTimeFromISO(appointment.datetime));
      setDurationMinutes(appointment.duration_minutes || 30);
      setTypeId(appointment.type_id ? String(appointment.type_id) : '');
      setStatus(appointment.status || 'PENDIENTE');
      setNotes(appointment.notes || '');
      setObraSocial(appointment.obra_social || '');
    } else {
      setPatientId(selfPatientId ? String(selfPatientId) : '');
      setFormDoctorId('');
      setSelectedDate(undefined);
      setTimeStr('');
      setDurationMinutes(30);
      setTypeId('');
      setStatus('PENDIENTE');
      setNotes('');
      setObraSocial('');
    }
  }, [appointment, open, selfPatientId]);

  // Auto-set duration from selected type
  useEffect(() => {
    if (typeId && !isEditing) {
      const selectedType = types.find((t) => String(t.id) === typeId);
      if (selectedType?.suggested_duration_minutes) {
        setDurationMinutes(selectedType.suggested_duration_minutes);
      }
    }
  }, [typeId, types, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Seleccioná un paciente');
      return;
    }
    if (!formDoctorId) {
      setError('Seleccioná un doctor');
      return;
    }
    if (!selectedDate) {
      setError('Seleccioná una fecha');
      return;
    }
    if (!timeStr) {
      setError('Ingresá un horario');
      return;
    }
    if (!typeId) {
      setError('Seleccioná un tipo de turno');
      return;
    }

    const dateStr = toLocalDateString(selectedDate);
    const datetime = `${dateStr}T${timeStr}:00`;

    const payload = {
      patient_id: Number(patientId),
      doctor_id: Number(formDoctorId),
      datetime,
      duration_minutes: durationMinutes,
      type_id: Number(typeId),
      notes: notes || undefined,
      obra_social: obraSocial || undefined,
    };

    if (isEditing) {
      payload.status = status;
    }

    try {
      setSaving(true);
      const result = isEditing
        ? await appointmentService.update(appointment.id, payload)
        : await appointmentService.create(payload);
      onSave?.(result);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar turno' : 'Nuevo turno'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modificá los datos del turno.'
                : 'Completá los datos para agendar un nuevo turno.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error */}
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
                {error}
              </div>
            )}

            {/* Patient — read-only for self-booking, selector for staff */}
            {selfPatientId ? (
              <div className="grid gap-2">
                <Label>Paciente</Label>
                <div className="text-sm text-foreground font-medium py-2 px-3 rounded-lg border border-border bg-muted/50">
                  Vos (auto-asignado)
                </div>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Seleccionar paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.first_name} {p.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Doctor */}
            <div className="grid gap-2">
              <Label htmlFor="doctor">Doctor/a</Label>
              <Select value={formDoctorId} onValueChange={setFormDoctorId}>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Seleccionar doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.first_name} {d.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    {selectedDate
                      ? selectedDate.toLocaleDateString('es-AR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Seleccionar fecha...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time slot picker */}
            <div className="grid gap-2">
              <Label>Horario</Label>
              <TimeSlotPicker
                date={selectedDate}
                appointments={appointments}
                value={timeStr}
                onChange={setTimeStr}
                durationMinutes={durationMinutes}
                editingId={appointment?.id}
                doctorId={doctorId}
              />
            </div>

            {/* Duration */}
            <div className="grid gap-2">
              <Label htmlFor="duration">Duración (min)</Label>
              <Select
                value={String(durationMinutes)}
                onValueChange={(v) => setDurationMinutes(Number(v))}
              >
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1:30 horas</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de turno</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: t.color }}
                        />
                        {t.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status (edit only) */}
            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Obra Social */}
            <div className="grid gap-2">
              <Label htmlFor="obra_social">Obra social (opcional)</Label>
              <Input
                id="obra_social"
                value={obraSocial}
                onChange={(e) => setObraSocial(e.target.value)}
                placeholder="Ej: OSDE, Swiss Medical..."
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear turno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentForm;
