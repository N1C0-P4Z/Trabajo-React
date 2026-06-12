import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import statsService from '../services/statsService';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';

const kpiConfig = [
  { key: 'totalPatients', label: 'Pacientes', icon: Users, color: 'text-blue-500' },
  { key: 'totalDoctors', label: 'Doctores', icon: Stethoscope, color: 'text-emerald-500' },
  { key: 'todayAppointments', label: 'Turnos hoy', icon: Calendar, color: 'text-amber-500' },
  { key: 'pendingAppointments', label: 'Pendientes', icon: Clock, color: 'text-orange-500' },
  { key: 'monthlyIncome', label: 'Ingresos', icon: DollarSign, color: 'text-violet-500', placeholder: true },
];

const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatValue = (key, value) => {
    if (key === 'monthlyIncome') {
      if (value === 0 || value === null) return 'No disponible';
      return `$${value.toLocaleString('es-AR')}`;
    }
    return value ?? 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general del sistema
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiConfig.map(({ key, label, icon: Icon, color, placeholder }) => {
          const value = stats?.[key];
          const isPlaceholder = placeholder && (value === 0 || value === null);

          return (
            <Card key={key}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle>
                  <span className={`flex items-center gap-2 ${color}`}>
                    <Icon className="size-5" />
                    {loading ? (
                      <span className="text-muted-foreground">—</span>
                    ) : isPlaceholder ? (
                      <span className="text-muted-foreground text-sm">No disponible</span>
                    ) : (
                      formatValue(key, value)
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPage;