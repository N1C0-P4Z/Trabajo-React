import React, { useMemo } from 'react';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';

const TITLES = {
  month: 'Resumen Mensual',
  week: 'Resumen Semanal',
  day: 'Resumen del Día',
};

const ResumenPanel = ({ appointments, viewMode }) => {
  const stats = useMemo(() => {
    const total = appointments.length;
    const completed = appointments.filter(
      (a) => a.status === 'COMPLETADO'
    ).length;
    const cancelled = appointments.filter(
      (a) => a.status === 'CANCELADO' || a.status === 'NO_ASISTIO'
    ).length;

    return { total, completed, cancelled };
  }, [appointments]);

  const title = TITLES[viewMode] || 'Resumen';

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="text-base font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4">
        {/* Total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <span className="text-sm text-muted-foreground">Total Turnos</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{stats.total}</span>
        </div>

        {/* Completados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-sm text-muted-foreground">Completados</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{stats.completed}</span>
        </div>

        {/* Cancelados */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
            <span className="text-sm text-muted-foreground">Cancelados</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{stats.cancelled}</span>
        </div>
      </div>
    </div>
  );
};

export default ResumenPanel;
