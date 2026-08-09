import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const PRIVACY_CONTENT = {
  intro:
    'Te informamos cómo tratamos tus datos personales en la clínica odontológica, de acuerdo con la Ley 25.326 de Protección de Datos Personales.',
  sections: [
    {
      title: 'Datos que recolectamos',
      text: 'Nombre, apellido, DNI, email, teléfono, obra social, alergias, notas médicas, historial de turnos y pagos. Son necesarios para la atención odontológica.',
    },
    {
      title: 'Finalidad',
      text: 'Gestión de turnos, atención clínica, facturación, comunicación relacionada con tu atención y cumplimiento de obligaciones legales.',
    },
    {
      title: 'Destinatarios',
      text: 'No cedemos tus datos a terceros salvo obligación legal o tu consentimiento. El personal con acceso está obligado al secreto profesional.',
    },
    {
      title: 'Tus derechos',
      text: 'Podés solicitar acceso, rectificación o baja de tus datos ante la clínica. También podés contactar a la AAIP (datospersonales@aaip.gob.ar).',
    },
    {
      title: 'Seguridad',
      text: 'Aplicamos medidas técnicas y organizativas para proteger tus datos frente a accesos no autorizados, pérdida o alteración.',
    },
  ],
};

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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
