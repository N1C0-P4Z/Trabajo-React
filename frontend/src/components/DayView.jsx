import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { isSameDay } from '@/lib/dateUtils';

const HOUR_HEIGHT = 192;
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = (TOTAL_HOURS + 1) * HOUR_HEIGHT;

const DayView = ({
  appointments,
  currentDate,
  onSlotClick,
  onAppointmentClick,
}) => {
  const dayAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const d = new Date(appt.datetime);
      return isSameDay(d, currentDate);
    });
  }, [appointments, currentDate]);

  const positionedAppointments = useMemo(() => {
    return dayAppointments.map((appt) => {
      const start = new Date(appt.datetime);
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const duration = appt.duration_minutes || 30;

      const startMinutes = (hours - START_HOUR) * 60 + minutes;
      const top = (startMinutes / 60) * HOUR_HEIGHT;
      const height = (duration / 60) * HOUR_HEIGHT;

      return {
        ...appt,
        top: Math.max(0, top),
        height: Math.max(20, height),
      };
    });
  }, [dayAppointments]);

  const timeSlots = [];
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
  }

  const handleSlotClick = (hour) => {
    const clickedDate = new Date(currentDate);
    clickedDate.setHours(hour, 0, 0, 0);
    onSlotClick?.(clickedDate);
  };

  return (
    /* Time grid */
    <div className="rounded-lg border border-border h-full overflow-y-auto">
      <div
        className="grid grid-cols-[50px_1fr] relative"
        style={{ height: TOTAL_HEIGHT }}
      >
        {/* Time labels */}
        <div className="relative border-r border-border" style={{ height: TOTAL_HEIGHT }}>
          {timeSlots.map((time, i) => (
            <div
              key={i}
                  className="absolute w-full text-xs text-muted-foreground text-right pr-1 leading-none"
                  style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2, transform: 'translateY(-50%)' }}
            >
              {time}
            </div>
          ))}
        </div>

        {/* Content column */}
        <div className="relative" style={{ height: TOTAL_HEIGHT }}>
          {/* Hour row lines */}
          {Array.from({ length: TOTAL_HOURS * 2 + 1 }).map((_, rowIdx) => {
            const isLast = rowIdx === TOTAL_HOURS * 2;
            const hour = START_HOUR + Math.floor(rowIdx / 2);
            const halfHour = rowIdx % 2 === 0 ? 0 : 30;
            return (
              <div
                key={rowIdx}
                className={cn(
                  'absolute w-full transition-colors',
                  isLast
                    ? 'border-t border-border'
                    : rowIdx % 2 === 0
                      ? 'border-t border-border cursor-pointer'
                      : 'border-t border-border/30 hover:bg-muted/20 cursor-pointer'
                )}
                style={{
                  top: (rowIdx * 0.5) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT / 2,
                }}
                onClick={isLast ? undefined : () => handleSlotClick(hour + halfHour / 60)}
              />
            );
          })}

          {/* Appointments */}
          {positionedAppointments.map((appt) => (
            <div
              key={appt.id}
              className={cn(
                'absolute left-1 right-1 rounded-lg p-2',
                'cursor-pointer hover:opacity-90 transition-opacity overflow-hidden'
              )}
              style={{
                top: appt.top,
                height: appt.height,
                backgroundColor: `${appt.type?.color || '#3B82F6'}CC`,
                color: '#fff',
              }}
              onClick={() => onAppointmentClick?.(appt)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {appt.patient?.first_name} {appt.patient?.last_name}
                  </p>
                  {appt.height > 50 && (
                    <p className="text-xs opacity-90 truncate">
                      Dr/a. {appt.doctor?.first_name} {appt.doctor?.last_name}
                    </p>
                  )}
                </div>
                <span className="text-xs font-medium opacity-90 shrink-0">
                  {new Date(appt.datetime).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {appt.height > 70 && (
                <div className="mt-1 flex items-center gap-1.5">
                  {appt.type && (
                    <span className="text-[11px] font-medium bg-white/20 rounded px-1.5 py-0.5">
                      {appt.type.name}
                    </span>
                  )}
                  <span className="text-[11px] opacity-80">
                    {appt.duration_minutes}min
                  </span>
                  {appt.obra_social && (
                    <span className="text-[11px] opacity-80 truncate">
                      {appt.obra_social}
                    </span>
                  )}
                </div>
              )}

              {appt.height > 90 && appt.notes && (
                <p className="text-[11px] opacity-80 mt-1 truncate">
                  {appt.notes}
                </p>
              )}
            </div>
          ))}

          {/* Empty state */}
          {positionedAppointments.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No hay turnos este día
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;
