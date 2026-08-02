/**
 * @fileoverview Política de privacidad (Art. 6 Ley 25.326).
 * Modal/dialog que explica datos recolectados, finalidad, destinatarios y derechos ARCO.
 * Se renderiza como enlace clickeable que abre un diálogo con el texto completo.
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Contenido de la política de privacidad basado en Ley 25.326.
 */
const PRIVACY_CONTENT = {
  intro:
    'De conformidad con la Ley 25.326 de Protección de Datos Personales y su decreto reglamentario 1558/2001, le informamos sobre el tratamiento de sus datos personales.',
  sections: [
    {
      title: 'Datos que recolectamos',
      text: 'Nombre, apellido, DNI, email, teléfono, datos de obra social, alergias, notas médicas, historial de turnos y pagos. Estos datos son necesarios para la prestación del servicio odontológico.',
    },
    {
      title: 'Finalidad del tratamiento',
      text: 'Sus datos serán utilizados exclusivamente para: gestión de turnos, prestación de servicios odontológicos, facturación, comunicación relacionada con su atención y cumplimiento de obligaciones legales.',
    },
    {
      title: 'Destinatarios',
      text: 'Sus datos no serán cedidos a terceros salvo obligación legal o consentimiento expreso. El personal de la clínica con acceso a sus datos está obligado al secreto profesional.',
    },
    {
      title: 'Derechos ARCO (Arts. 14-16)',
      text: 'Usted tiene derecho a: Acceder a sus datos personales; Rectificar datos inexactos; Cancelar datos cuando ya no sean necesarios; Oponerse al tratamiento de sus datos. Para ejercer estos derechos, puede solicitar la exportación de sus datos o la eliminación de su cuenta desde su perfil.',
    },
    {
      title: 'Seguridad',
      text: 'Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos contra acceso no autorizado, pérdida o alteración, conforme a la Resolución AAIP 47/2018.',
    },
    {
      title: 'Base legal',
      text: 'El tratamiento de sus datos se basa en su consentimiento expreso (Art. 5 Ley 25.326) y en la necesidad de prestar el servicio odontológico contratado.',
    },
  ],
  contact:
    'Para consultas sobre privacidad: datospersonales@aaip.gob.ar | Av. Pte. Gral. Julio A. Roca 710, Piso 2, CABA.',
};

/**
 * Componente de política de privacidad.
 * Renderiza un enlace que abre un diálogo modal con el texto completo.
 *
 * @param {Object} props
 * @param {string} [props.className] - Clases CSS adicionales para el enlace trigger
 * @returns {JSX.Element}
 */
const PrivacyPolicy = ({ className = '' }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`text-primary hover:underline text-xs font-medium ${className}`}
        >
          Política de Privacidad
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Política de Privacidad</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{PRIVACY_CONTENT.intro}</p>
            {PRIVACY_CONTENT.sections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-foreground mb-1">
                  {section.title}
                </h4>
                <p>{section.text}</p>
              </div>
            ))}
            <p className="text-xs border-t border-border pt-3">
              {PRIVACY_CONTENT.contact}
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
