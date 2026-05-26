import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getMonthDays(year, month) {
  // month is 0-indexed (0 = January)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];
  const totalDays = lastDay.getDate();

  // Get the day of week of the 1st (0 = Sunday, 1 = Monday, ...)
  let startDayOfWeek = firstDay.getDay();
  // Convert to Monday-based: 0 = Monday, 6 = Sunday
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Add empty cells for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // Add actual days
  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isToday(date) {
  return isSameDay(date, new Date());
}

const CalendarGrid = ({ appointments, currentDate, onDateChange, onDayClick, onPrev, onNext }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const monthLabel = currentDate.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      const d = new Date(appt.datetime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [appointments]);

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={onPrev}>
            ‹
          </Button>
          <Button variant="outline" size="sm" onClick={onNext}>
            ›
          </Button>
        </div>
        <h2 className="text-lg font-semibold capitalize text-foreground">
          {monthLabel}
        </h2>
        <div className="w-[68px]" /> {/* spacer for centering */}
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-muted/50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-medium text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[80px] border-b border-r border-border bg-muted/20"
                />
              );
            }

            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayAppts = appointmentsByDay[key] || [];
            const today = isToday(day);

            return (
              <div
                key={key}
                className={cn(
                  'min-h-[80px] border-b border-r border-border p-1',
                  'cursor-pointer hover:bg-muted/30 transition-colors',
                  today && 'bg-primary/5'
                )}
                onClick={() => onDayClick(day)}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className={cn(
                      'text-xs font-medium px-1.5 py-0.5 rounded-full',
                      today
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {day.getDate()}
                  </span>
                  {dayAppts.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {dayAppts.length}
                    </span>
                  )}
                </div>

                {/* Appointment dots/compact cards */}
                <div className="space-y-0.5">
                  {dayAppts.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      className="text-[10px] truncate rounded px-1 py-0.5 leading-none"
                      style={{
                        backgroundColor: `${appt.type?.color || '#3B82F6'}20`,
                        color: appt.type?.color || '#3B82F6',
                      }}
                      title={`${appt.patient?.first_name} ${appt.patient?.last_name} — ${new Date(appt.datetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
                    >
                      {new Date(appt.datetime).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}{' '}
                      {appt.patient?.last_name}
                    </div>
                  ))}
                  {dayAppts.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1">
                      +{dayAppts.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
