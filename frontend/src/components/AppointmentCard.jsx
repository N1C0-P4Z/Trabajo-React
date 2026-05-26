import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusLabels = {
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  EN_CURSO: 'En curso',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
  NO_ASISTIO: 'No asistió',
};

const statusVariants = {
  PENDIENTE: 'outline',
  CONFIRMADO: 'default',
  EN_CURSO: 'secondary',
  COMPLETADO: 'default',
  CANCELADO: 'destructive',
  NO_ASISTIO: 'outline',
};

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function getEndTime(dateStr, durationMinutes) {
  const end = new Date(new Date(dateStr).getTime() + durationMinutes * 60000);
  return formatTime(end.toISOString());
}

const AppointmentCard = ({ appointment, onClick, variant = 'expanded' }) => {
  const { patient, doctor, type, datetime, duration_minutes, status, notes, obra_social } = appointment;
  const typeColor = type?.color || '#3B82F6';

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left px-1.5 py-0.5 rounded text-xs truncate hover:opacity-80 transition-opacity"
        style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
        title={`${patient?.first_name} ${patient?.last_name} — ${formatTime(datetime)}`}
      >
        <span className="font-medium">{formatTime(datetime)}</span>{' '}
        {patient?.last_name}, {patient?.first_name?.charAt(0)}.
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border border-border bg-card p-3',
        'hover:bg-muted/50 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
      )}
    >
      {/* Colored left border by type */}
      <div className="flex gap-3">
        <div
          className="w-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: typeColor }}
        />

        <div className="flex-1 min-w-0 space-y-1">
          {/* Header row: patient name + status badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm text-foreground truncate">
                {patient?.first_name} {patient?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Dr/a. {doctor?.first_name} {doctor?.last_name}
              </p>
            </div>
            <Badge variant={statusVariants[status] || 'outline'} className="text-[10px] px-1.5 py-0 shrink-0">
              {statusLabels[status] || status}
            </Badge>
          </div>

          {/* Time + Type */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatTime(datetime)} – {getEndTime(datetime, duration_minutes)}
            </span>
            <span>·</span>
            <span>{formatDuration(duration_minutes)}</span>
            {type && (
              <>
                <span>·</span>
                <span
                  className="inline-flex items-center gap-1"
                  style={{ color: typeColor }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: typeColor }}
                  />
                  {type.name}
                </span>
              </>
            )}
          </div>

          {/* Notes or obra social */}
          {(notes || obra_social) && (
            <div className="text-xs text-muted-foreground/70 truncate">
              {obra_social && <span>{obra_social}</span>}
              {obra_social && notes && <span> · </span>}
              {notes && <span>{notes}</span>}
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default AppointmentCard;
