import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import patientService from '../services/patientService';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Constants ---

const OBRA_SOCIAL_FORM_OPTIONS = [
  { value: 'NINGUNA', label: 'Sin obra social' },
  { value: 'OSDE', label: 'OSDE' },
  { value: 'Swiss Medical', label: 'Swiss Medical' },
  { value: 'Galeno', label: 'Galeno' },
  { value: 'PAMI', label: 'PAMI' },
  { value: 'Particular', label: 'Particular' },
];

// --- Schema ---

const patientSchema = z.object({
  dni: z.string().min(1, 'El DNI es requerido'),
  obra_social: z.string().optional().or(z.literal('')),
  numero_afiliado: z.string().optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  telefono_alternativo: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

// --- Component ---

const PatientFormModal = ({ open, onOpenChange, onSuccess, patient }) => {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const isEditing = Boolean(patient);

  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      dni: '',
      obra_social: 'NINGUNA',
      numero_afiliado: '',
      fecha_nacimiento: '',
      direccion: '',
      telefono_alternativo: '',
      is_active: true,
    },
  });

  // Reset form when modal opens/closes or patient changes
  useEffect(() => {
    if (open) {
      if (patient) {
        form.reset({
          dni: patient.dni || '',
          obra_social: patient.obra_social || 'NINGUNA',
          numero_afiliado: patient.numero_afiliado || '',
          fecha_nacimiento: patient.fecha_nacimiento
            ? patient.fecha_nacimiento.slice(0, 10)
            : '',
          direccion: patient.direccion || '',
          telefono_alternativo: patient.telefono_alternativo || '',
          is_active: patient.is_active !== false,
        });
      } else {
        form.reset({
          dni: '',
          obra_social: 'NINGUNA',
          numero_afiliado: '',
          fecha_nacimiento: '',
          direccion: '',
          telefono_alternativo: '',
          is_active: true,
        });
      }
      setServerError(null);
    }
  }, [open, patient, form]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);

    try {
      // Remove empty optional fields before sending
      const payload = { ...data };
      if (payload.obra_social === 'NINGUNA') delete payload.obra_social;
      if (!payload.numero_afiliado) delete payload.numero_afiliado;
      if (!payload.fecha_nacimiento) delete payload.fecha_nacimiento;
      if (!payload.direccion) delete payload.direccion;
      if (!payload.telefono_alternativo) delete payload.telefono_alternativo;

      await patientService.update(patient.id, payload);

      toast.success('Paciente actualizado', {
        description: `Los datos del paciente fueron guardados correctamente.`,
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isEditing) {
    return null;
  }

  const patientName =
    patient?.user?.first_name && patient?.user?.last_name
      ? `${patient.user.first_name} ${patient.user.last_name}`
      : `#${patient?.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Paciente</DialogTitle>
          <DialogDescription>
            Modificá los datos administrativos de{' '}
            <span className="font-medium text-foreground">
              {patientName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Server error */}
            {serverError && (
              <div className="rounded-md bg-destructive/10 text-destructive text-xs p-2.5">
                {serverError}
              </div>
            )}

            {/* DNI */}
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <Input placeholder="12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Obra Social */}
            <FormField
              control={form.control}
              name="obra_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obra Social</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar obra social" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {OBRA_SOCIAL_FORM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Número de Afiliado */}
            <FormField
              control={form.control}
              name="numero_afiliado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Afiliado (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="000123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha de Nacimiento */}
            <FormField
              control={form.control}
              name="fecha_nacimiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Nacimiento (opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dirección — native textarea (no shadcn Textarea available) */}
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección (opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[70px] w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs/relaxed dark:bg-input/30 resize-y"
                      placeholder="Av. Corrientes 1234, CABA"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teléfono Alternativo */}
            <FormField
              control={form.control}
              name="telefono_alternativo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono Alternativo (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 11 1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* is_active toggle — button nativo en vez de Switch de radix-ui */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <FormLabel className="text-xs font-medium cursor-pointer">
                    Paciente Activo
                  </FormLabel>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={field.value}
                    onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      field.value ? "bg-primary" : "bg-input"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        field.value ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientFormModal;
