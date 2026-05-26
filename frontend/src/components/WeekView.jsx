import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

function getWeekDays(date) {
  const day = date.getDay();
  // Monday-based: 0 = Monday, 6 = Sunday
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

function formatWeekRange(days) {
  const first = days[0];
  const last = days[6];
  const opts = { day: 'numeric', month: 'long' };

  if (first.getFullYear() !== last.getFullYear()) {
    return `${first.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })} – ${last.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })}`;
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${first.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })} – ${last.toLocaleDateString('es-AR', { ...opts, year: 'numeric' })}`;
  }
  return `${first.getDate()} – ${last.getDate()} de ${first.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`;
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const WeekView = ({ appointments, currentDate, onDateChange, onSlotClick, onAppointmentClick, onPrev, onNext }) => {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  // Group appointments by day and compute position
  const positionedAppointments = useMemo(() => {
    const result = [];

    // For each day, collect appointments that fall on that day
    weekDays.forEach((day, dayIndex) => {
      const dayAppts = appointments.filter((appt) => {
        const d = new Date(appt.datetime);
        return isSameDay(d, day);
      });

      dayAppts.forEach((appt) => {
        const start = new Date(appt.datetime);
        const hours = start.getHours();
        const minutes = start.getMinutes();
        const duration = appt.duration_minutes || 30;

        // Calculate top position from START_HOUR
        const startMinutes = (hours - START_HOUR) * 60 + minutes;
        const top = (startMinutes / (TOTAL_HOURS * 60)) * TOTAL_HEIGHT;
        const height = (duration / (TOTAL_HOURS * 60)) * TOTAL_HEIGHT;

        result.push({
          ...appt,
          dayIndex,
          top: Math.max(0, top),
          height: Math.max(20, height),
        });
      });
    });

    return result;
  }, [appointments, weekDays]);

  // Time labels
  const timeSlots = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
  }

  const weekLabel = formatWeekRange(weekDays);

  const handleSlotClick = (day, hour) => {
    const clickedDate = new Date(day);
    clickedDate.setHours(hour, 0, 0, 0);
    onSlotClick?.(clickedDate);
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
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
          {weekLabel}
        </h2>
        <div className="w-[68px]" />
      </div>

      {/* Week grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] bg-muted/50 border-b border-border">
          <div className="px-2 py-2 text-xs text-muted-foreground" />
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                'px-2 py-2 text-center border-l border-border',
                isToday(day) && 'bg-primary/10'
              )}
            >
              <div className="text-xs font-medium text-foreground">
                {WEEKDAYS[i]}
              </div>
              <div
                className={cn(
                  'text-xs mt-0.5',
                  isToday(day)
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground'
                )}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Body: time grid */}
        <div
          className="grid grid-cols-[50px_repeat(7,1fr)] relative"
          style={{ minHeight: TOTAL_HEIGHT }}
        >
          {/* Time labels */}
          <div className="relative">
            {timeSlots.map((time, i) => (
              <div
                key={i}
                className="absolute w-full text-[10px] text-muted-foreground text-right pr-2"
                style={{ top: i * HOUR_HEIGHT, transform: 'translateY(-50%)' }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className={cn(
                'relative border-l border-border',
                isToday(day) && 'bg-primary/[0.02]'
              )}
              style={{ minHeight: TOTAL_HEIGHT }}
            >
              {/* Hour row lines — clickable slots */}
              {Array.from({ length: TOTAL_HOURS * 2 }).map((_, rowIdx) => {
                const hour = START_HOUR + Math.floor(rowIdx / 2);
                const halfHour = rowIdx % 2 === 0 ? 0 : 30;
                return (
                  <div
                    key={rowIdx}
                    className="absolute w-full border-t border-border/30 hover:bg-muted/20 cursor-pointer transition-colors"
                    style={{
                      top: (rowIdx * 0.5) * HOUR_HEIGHT,
                      height: HOUR_HEIGHT / 2,
                    }}
                    onClick={() => handleSlotClick(day, hour + halfHour / 60)}
                  />
                );
              })}

              {/* Appointments */}
              {positionedAppointments
                .filter((a) => a.dayIndex === dayIdx)
                .map((appt) => (
                  <div
                    key={appt.id}
                    className={cn(
                      'absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5',
                      'cursor-pointer hover:opacity-90 transition-opacity overflow-hidden',
                      'border border-white/10'
                    )}
                    style={{
                      top: appt.top,
                      height: appt.height,
                      backgroundColor: `${appt.type?.color || '#3B82F6'}CC`,
                      color: '#fff',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick?.(appt);
                    }}
                  >
                    <div className="text-[10px] font-medium leading-tight truncate">
                      {new Date(appt.datetime).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-[10px] leading-tight truncate">
                      {appt.patient?.last_name}, {appt.patient?.first_name?.charAt(0)}.
                    </div>
                    {appt.height > 40 && appt.type && (
                      <div className="text-[9px] opacity-80 leading-tight truncate">
                        {appt.type.name}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
