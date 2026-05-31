import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { isSameDay, isToday } from '@/lib/dateUtils';

const HOUR_HEIGHT = 192; // px per hour
const START_HOUR = 8;
const END_HOUR = 20;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const TOTAL_HEIGHT = (TOTAL_HOURS + 1) * HOUR_HEIGHT;

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

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const WeekView = ({ appointments, currentDate, onSlotClick, onAppointmentClick }) => {
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
        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = (duration / 60) * HOUR_HEIGHT;

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

  const handleSlotClick = (day, hour) => {
    const clickedDate = new Date(day);
    clickedDate.setHours(hour, 0, 0, 0);
    onSlotClick?.(clickedDate);
  };

  return (
    /* Week grid */
    <div className="rounded-lg border border-border h-full flex flex-col">
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

        {/* Body: time grid — scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div
            className="grid grid-cols-[50px_repeat(7,1fr)] relative"
            style={{ height: TOTAL_HEIGHT }}
          >
            {/* Time labels */}
            <div className="relative">
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

            {/* Day columns */}
            {weekDays.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={cn(
                  'relative border-l border-border',
                  isToday(day) && 'bg-primary/[0.02]'
                )}
                style={{ height: TOTAL_HEIGHT }}
              >
                {/* Hour row lines — clickable slots */}
                {Array.from({ length: TOTAL_HOURS * 2 + 1 }).map((_, rowIdx) => {
                  const isLast = rowIdx === TOTAL_HOURS * 2;
                  const hour = START_HOUR + Math.floor(rowIdx / 2);
                  const halfHour = rowIdx % 2 === 0 ? 0 : 30;
                  return (
                    <div
                      key={rowIdx}
                      className={cn(
                        'absolute w-full border-t border-border/30 transition-colors',
                        !isLast && 'cursor-pointer hover:bg-muted/20'
                      )}
                      style={{
                        top: (rowIdx * 0.5) * HOUR_HEIGHT,
                        height: HOUR_HEIGHT / 2,
                      }}
                      onClick={isLast ? undefined : () => handleSlotClick(day, hour + halfHour / 60)}
                    />
                  );
                })}

                {/* Appointments — same layout as DayView */}
                {positionedAppointments
                  .filter((a) => a.dayIndex === dayIdx)
                  .map((appt) => (
                    <div
                      key={appt.id}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded-lg p-1.5',
                        'cursor-pointer hover:opacity-90 transition-opacity overflow-hidden'
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
                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {appt.patient?.first_name} {appt.patient?.last_name}
                          </p>
                          {appt.height > 50 && (
                            <p className="text-[10px] opacity-90 truncate">
                              Dr/a. {appt.doctor?.first_name} {appt.doctor?.last_name}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-medium opacity-90 shrink-0">
                          {new Date(appt.datetime).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {appt.height > 70 && (
                        <div className="mt-1 flex items-center gap-1 flex-wrap">
                          {appt.type && (
                            <span className="text-[10px] font-medium bg-white/20 rounded px-1 py-0.5">
                              {appt.type.name}
                            </span>
                          )}
                          <span className="text-[10px] opacity-80">
                            {appt.duration_minutes}min
                          </span>
                          {appt.obra_social && (
                            <span className="text-[10px] opacity-80 truncate">
                              {appt.obra_social}
                            </span>
                          )}
                        </div>
                      )}

                      {appt.height > 90 && appt.notes && (
                        <p className="text-[10px] opacity-80 mt-0.5 truncate">
                          {appt.notes}
                        </p>
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
