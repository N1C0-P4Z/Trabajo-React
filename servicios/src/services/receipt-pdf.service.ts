import PDFDocument from 'pdfkit';

const METHOD_LABELS = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  OBRA_SOCIAL: 'Obra social',
};

export function buildReceiptPdf(payment: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const clinicName = process.env.CLINIC_NAME || 'Clínica Odontológica';
    const year = payment.paid_at.getFullYear();
    const nro = payment.receipt_number ? `REC-${year}-${payment.receipt_number}` : '-';
    const paciente = `${payment.patient.first_name} ${payment.patient.last_name}`;
    const dni = payment.patient.patient?.dni || payment.patient.dni || '';
    const obraSocial =
      payment.patient.patient?.obra_social || payment.appointment?.obra_social || '-';
    const tipo = payment.appointment?.type?.name || '-';
    const dentista = payment.appointment?.doctor
      ? `${payment.appointment.doctor.first_name} ${payment.appointment.doctor.last_name}`
      : '-';
    const fecha = payment.paid_at.toLocaleDateString('es-AR');
    const metodo = METHOD_LABELS[payment.payment_method as keyof typeof METHOD_LABELS] || payment.payment_method;

    doc.fontSize(16).text(clinicName, { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(13).text('Comprobante de consulta', { align: 'center' });
    doc.fontSize(11).text(nro, { align: 'center' });
    doc.moveDown();

    doc.fontSize(11);
    doc.text(`Paciente: ${paciente}`);
    if (dni) doc.text(`DNI: ${dni}`);
    doc.text(`Fecha: ${fecha}`);
    doc.text(`Tipo de turno: ${tipo}`);
    doc.text(`Dentista: ${dentista}`);
    doc.text(`Monto: $${Number(payment.amount).toFixed(2)}`);
    doc.text(`Método de pago: ${metodo}`);
    doc.text(`Obra social: ${obraSocial}`);
    doc.moveDown();

    if (payment.status === 'ANULADO') {
      doc.fillColor('red').fontSize(14).text('ANULADO', { align: 'center' });
      doc.fillColor('black');
      doc.moveDown();
    }

    doc.fontSize(9).text('Este comprobante no es una factura ARCA.', { align: 'center' });
    doc.end();
  });
}
