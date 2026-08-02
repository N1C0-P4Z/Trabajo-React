/**
 * @fileoverview Banner de confidencialidad (Art. 10 Ley 25.326).
 * Se muestra después del login a usuarios con rol DENTIST o SECRETARY
 * para recordarles su obligación de secreto profesional sobre datos de pacientes.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ShieldAlert, X } from 'lucide-react';

const CONFIDENTIALITY_STORAGE_KEY = 'confidentiality_notice_dismissed';

const CONFIDENTIALITY_TEXT =
  'Recordatorio: Como personal de la clínica, usted tiene la obligación legal de mantener el secreto profesional sobre los datos personales y clínicos de los pacientes (Art. 10 Ley 25.326). El acceso no autorizado o la divulgación de datos de pacientes puede generar responsabilidad civil y penal.';

/**
 * Banner de confidencialidad para DENTIST y SECRETARY.
 * Se muestra una vez por sesión; el usuario puede cerrarlo.
 *
 * @returns {JSX.Element|null}
 */
const ConfidentialityNotice = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when user changes (new login)
  useEffect(() => {
    setDismissed(false);
  }, [user?.id]);

  // Only show for DENTIST and SECRETARY
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
            Secreto Profesional Obligatorio
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
