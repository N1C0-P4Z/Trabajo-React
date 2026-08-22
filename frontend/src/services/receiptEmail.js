import emailjs from '@emailjs/browser';
import { toast } from 'sonner';

export async function trySendReceiptEmail(payment, previewToken) {
  if (!previewToken) return;
  if (payment.status !== 'COMPLETADO' && payment.status !== 'ANULADO') return;

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return;
  }

  const fromEnv = import.meta.env.VITE_PUBLIC_APP_ORIGIN;
  let origin = window.location.origin;
  if (window.location.pathname.startsWith('/~')) {
    origin += `/${window.location.pathname.split('/')[1]}`;
  }
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) {
    origin = fromEnv.replace(/\/$/, '');
  }
  const previewUrl = `${origin}/receipt-preview?token=${encodeURIComponent(previewToken)}`;
  const tipo = payment.appointment?.type?.name || '-';
  const dentista = payment.appointment?.doctor
    ? `${payment.appointment.doctor.first_name} ${payment.appointment.doctor.last_name}`
    : '-';
  const paciente = payment.patient
    ? `${payment.patient.first_name} ${payment.patient.last_name}`
    : '';

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: payment.patient?.email || '',
        clinic_name: 'Clínica Odontológica',
        paciente,
        fecha: new Date(payment.paid_at).toLocaleDateString('es-AR'),
        monto: String(payment.amount),
        tipo,
        dentista,
        preview_url: previewUrl,
      },
      { publicKey }
    );
  } catch {
    toast.error('No se pudo enviar el aviso por email');
  }
}
