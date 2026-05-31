import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

const START_HOUR = 8; // 08:00
const END_HOUR = 20; // 20:00 (last slot at 19:30)

/**
 * Convert "HH:MM" string to minutes from midnight.
 * @param {string} timeStr
 * @returns {number}
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format minutes-from-midnight back to "HH:MM".
 * @param {number} minutes
 * @returns {string}
 */
function formatSlot(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Check if two Date objects fall on the same calendar day.
 * @param {Date} d1
 * @param {Date} d2
 * @returns {boolean}
 */
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Visual grid of 30-minute time slots (08:00–19:30).
 *
 * Props:
 * - date: Date | undefined — the selected date
 * - appointments: Array — all appointments (filtered by date internally)
 * - value: string — currently selected time "HH:MM"
 * - onChange: (time: string) => void
 * - durationMinutes: number — duration in minutes (default 30)
 * - disabled?: boolean
 * - editingId?: number — exclude this appointment from conflict check
 */
const TimeSlotPicker = ({
  date,
  appointments = [],
  value,
  onChange,
  durationMinutes = 30,
  disabled = false,
  editingId,
  doctorId = 'all',
}) => {
  // Generate all 30-min slot start times (in minutes from midnight)
  const slots = useMemo(() => {
    const result = [];
    for (let m = START_HOUR * 60; m < END_HOUR * 60; m += 30) {
      result.push(m);
    }
    return result;
  }, []);

  // Filter appointments by selected doctor (if any)
  const relevantAppointments = useMemo(() => {
    if (doctorId === 'all') return appointments;
    return appointments.filter((a) => String(a.doctor_id) === doctorId);
  }, [appointments, doctorId]);

  // Compute which slots are occupied by existing appointments on the given date
  const occupiedSlots = useMemo(() => {
    if (!date || !relevantAppointments.length) return new Set();

    const occupied = new Set();

    for (const apt of relevantAppointments) {
      // Skip the appointment being edited (can't conflict with itself)
      if (editingId != null && apt.id === editingId) continue;
      if (!apt.datetime) continue;

      const aptDate = new Date(apt.datetime);
      if (!isSameDay(aptDate, date)) continue;

      // Extract HH:MM from ISO datetime (e.g. "2026-05-31T14:30:00")
      const aptTime = apt.datetime.substring(11, 16);
      const aptStart = timeToMinutes(aptTime);
      const aptEnd = aptStart + (apt.duration_minutes || 30);

      // Mark every 30-min slot this appointment overlaps with
      for (const slotStart of slots) {
        const slotEnd = slotStart + 30;
        // Slot-level overlap: appointmentStart < slotEnd AND slotStart < appointmentEnd
        if (aptStart < slotEnd && slotStart < aptEnd) {
          occupied.add(slotStart);
        }
      }
    }

    return occupied;
  }, [date, relevantAppointments, editingId, slots]);

  // No date selected → show placeholder
  if (!date) {
    return (
      <div className="text-sm text-muted-foreground italic py-3">
        Primero seleccioná una fecha
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {slots.map((slotMinutes) => {
        const timeStr = formatSlot(slotMinutes);
        const isSelected = value === timeStr;
        const isBooked = occupiedSlots.has(slotMinutes);

        return (
          <button
            key={timeStr}
            type="button"
            disabled={disabled || isBooked}
            onClick={() => onChange(timeStr)}
            className={cn(
              'rounded-lg px-2 py-2 text-xs font-medium transition-colors',
              // Selected slot
              isSelected && 'bg-primary text-primary-foreground shadow-sm',
              // Booked (and not selected)
              !isSelected &&
                isBooked &&
                'border border-border/30 text-muted-foreground/40 line-through cursor-not-allowed bg-muted/20',
              // Available (and not selected)
              !isSelected &&
                !isBooked &&
                'border border-border text-foreground hover:bg-muted'
            )}
          >
            {timeStr}
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;
