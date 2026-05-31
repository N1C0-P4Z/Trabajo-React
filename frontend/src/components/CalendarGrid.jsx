import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { isToday, toLocalDateString } from '@/lib/dateUtils';

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);

  // Monday-based: 0 = Monday, 6 = Sunday
  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Find Monday of the week containing the 1st
  const startDate = new Date(year, month, 1 - startDayOfWeek);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function isCurrentMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() === month;
}

const CalendarGrid = ({ appointments, currentDate, onDayClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = useMemo(() => getMonthGrid(year, month), [year, month]);

  // Group appointments by day (YYYY-MM-DD key)
  const appointmentsByDay = useMemo(() => {
    const map = {};
    appointments.forEach((appt) => {
      const d = new Date(appt.datetime);
      const key = toLocalDateString(d);
      if (!map[key]) map[key] = [];
      map[key].push(appt);
    });
    return map;
  }, [appointments]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-muted/50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-[10px] font-medium uppercase text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells with gap-px border effect */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((day, idx) => {
          const key = toLocalDateString(day);
          const dayAppts = appointmentsByDay[key] || [];
          const today = isToday(day);
          const inMonth = isCurrentMonth(day, year, month);

          return (
            <div
              key={key + '-' + idx}
              className={cn(
                'min-h-[100px] p-1.5 bg-card cursor-pointer hover:bg-muted/30 transition-colors',
                !inMonth && 'opacity-40',
                today && 'bg-primary/5 ring-1 ring-primary ring-inset'
              )}
              onClick={() => onDayClick(day)}
            >
              {/* Day number */}
              <span
                className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold',
                  today
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                    : 'text-muted-foreground'
                )}
              >
                {day.getDate()}
              </span>

              {/* Appointment cards */}
              <div className="mt-0.5 space-y-0.5">
                {dayAppts.slice(0, 3).map((appt) => (
                  <div
                    key={appt.id}
                    className="text-xs px-1.5 py-0.5 rounded truncate"
                    style={{
                      backgroundColor: `${appt.type?.color || 'var(--primary)'}20`,
                      color: appt.type?.color || undefined,
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
  );
};

export default CalendarGrid;
