import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X } from 'lucide-react';

const CONFIDENTIALITY_TEXT =
  'Recordatorio: como personal de la clínica, tenés obligación de secreto profesional sobre los datos de los pacientes. El acceso o la divulgación no autorizada pueden generar responsabilidad civil y penal.';

/** Aviso de confidencialidad para dentistas y secretaría (se puede cerrar por sesión). */
const ConfidentialityNotice = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(false);
  }, [user?.id]);

  if (!user || (user.role !== 'DENTIST' && user.role !== 'SECRETARY')) {
    return null;
  }

  if (dismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      className="relative w-full rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 mb-4"
    >
      <div className="flex items-start gap-3 pr-8">
        <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            Secreto profesional
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
            {CONFIDENTIALITY_TEXT}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 size-6 p-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
        onClick={() => setDismissed(true)}
        aria-label="Cerrar aviso de confidencialidad"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
};

export default ConfidentialityNotice;
