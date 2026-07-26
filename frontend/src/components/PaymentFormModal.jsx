import React, { useEffect, useState } from 'react';
import paymentService from '../services/paymentService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAYMENT_METHODS = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'OBRA_SOCIAL', label: 'Obra social' },
];

const STATUS_OPTIONS = [
  { value: 'COMPLETADO', label: 'Completado' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'ANULADO', label: 'Anulado' },
];

function toDateInputValue(date) {
  if (!date) return '';
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const PaymentFormModal = ({
  open,
  onOpenChange,
  onSuccess,
  payment,
  patients = [],
}) => {
  const isEditing = Boolean(payment);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO');
  const [status, setStatus] = useState('COMPLETADO');
  const [paidAt, setPaidAt] = useState(toDateInputValue(new Date()));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;

    if (payment) {
      setPatientId(String(payment.patient_id));
      setAmount(String(payment.amount));
      setPaymentMethod(payment.payment_method);
      setStatus(payment.status);
      setPaidAt(toDateInputValue(payment.paid_at));
      setNotes(payment.notes || '');
    } else {
      setPatientId('');
      setAmount('');
      setPaymentMethod('EFECTIVO');
      setStatus('COMPLETADO');
      setPaidAt(toDateInputValue(new Date()));
      setNotes('');
    }
    setError('');
  }, [open, payment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEditing && !patientId) {
      setError('Seleccioná un paciente');
      return;
    }

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresá un monto válido mayor a cero');
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await paymentService.update(payment.id, {
          amount: parsedAmount,
          payment_method: paymentMethod,
          status,
          paid_at: paidAt,
          notes: notes || undefined,
        });
      } else {
        await paymentService.create({
          patient_id: Number(patientId),
          amount: parsedAmount,
          payment_method: paymentMethod,
          status,
          paid_at: paidAt,
          notes: notes || undefined,
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar pago' : 'Registrar pago'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modificá los datos del pago registrado.'
                : 'Completá los datos para registrar un nuevo pago.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">
                {error}
              </div>
            )}

            {!isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select value={patientId} onValueChange={setPatientId}>
                  <SelectTrigger id="patient">
                    <SelectValue placeholder="Seleccionar paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.user_id} value={String(p.user_id)}>
                        {p.user?.first_name} {p.user?.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isEditing && payment?.patient && (
              <div className="grid gap-2">
                <Label>Paciente</Label>
                <div className="text-sm font-medium py-2 px-3 rounded-lg border border-border bg-muted/50">
                  {payment.patient.first_name} {payment.patient.last_name}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Monto (ARS)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment_method">Método de pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="payment_method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paid_at">Fecha de pago</Label>
              <Input
                id="paid_at"
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
              />
            </div>

            {isEditing && (
              <div className="grid gap-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalle del pago..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { PAYMENT_METHODS, STATUS_OPTIONS };
export default PaymentFormModal;
