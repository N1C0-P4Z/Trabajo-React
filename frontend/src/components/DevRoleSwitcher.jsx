import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import userService from '../services/userService';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'SECRETARY', label: 'Secretaria' },
  { value: 'DENTIST', label: 'Dentista' },
];

const DevRoleSwitcher = () => {
  const {
    canSimulateRoles,
    simulatedRole,
    simulatedUserId,
    setSimulatedRole,
    clearRoleSimulation,
  } = useAuth();

  const [dentists, setDentists] = useState([]);
  const [loadingDentists, setLoadingDentists] = useState(false);

  useEffect(() => {
    if (!canSimulateRoles || simulatedRole !== 'DENTIST') return;

    let cancelled = false;
    setLoadingDentists(true);

    userService
      .getDoctors()
      .then((data) => {
        if (cancelled) return;
        setDentists(data);
        if (data.length > 0 && !simulatedUserId) {
          setSimulatedRole('DENTIST', data[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setDentists([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingDentists(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canSimulateRoles, simulatedRole, simulatedUserId, setSimulatedRole]);

  if (!canSimulateRoles) return null;

  const activeValue = simulatedRole || 'admin';

  const handleRoleChange = (value) => {
    if (value === 'admin') {
      clearRoleSimulation();
      return;
    }

    if (value === 'DENTIST') {
      if (dentists.length > 0) {
        setSimulatedRole('DENTIST', simulatedUserId || dentists[0].id);
      } else {
        setSimulatedRole('DENTIST', null);
      }
      return;
    }

    setSimulatedRole(value);
  };

  return (
    <div className="mb-3 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 mb-2">
        Dev — simular rol
      </p>

      <div className="flex flex-wrap gap-1.5">
        {ROLE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={activeValue === option.value ? 'default' : 'outline'}
            className="h-7 px-2 text-xs"
            onClick={() => handleRoleChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {simulatedRole === 'DENTIST' && (
        <div className="mt-2">
          {loadingDentists ? (
            <p className="text-xs text-muted-foreground">Cargando dentistas...</p>
          ) : dentists.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay dentistas para simular.
            </p>
          ) : (
            <Select
              value={simulatedUserId ? String(simulatedUserId) : undefined}
              onValueChange={(value) => setSimulatedRole('DENTIST', Number(value))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Elegir dentista..." />
              </SelectTrigger>
              <SelectContent>
                {dentists.map((dentist) => (
                  <SelectItem key={dentist.id} value={String(dentist.id)}>
                    {dentist.first_name} {dentist.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {simulatedRole && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Viendo la app como <span className="font-medium text-foreground">{simulatedRole}</span>
          {simulatedRole === 'DENTIST' && simulatedUserId
            ? ` (id ${simulatedUserId})`
            : ''}
        </p>
      )}
    </div>
  );
};

export default DevRoleSwitcher;
