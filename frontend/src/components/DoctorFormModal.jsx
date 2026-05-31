import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userService from '../services/userService';
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
import { Switch } from '@/components/ui/switch';

const doctorSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30),
  email: z.string().email('Email inválido'),
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  phone: z.string().min(6, 'Teléfono inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  specialty: z.string().min(1, 'Seleccioná una especialidad'),
  license_number: z.string().optional().or(z.literal('')),
  avatar_url: z.string().url('URL inválida').optional().or(z.literal('')),
  is_active: z.boolean().default(true),
});

const DoctorFormModal = ({ open, onOpenChange, onSuccess, doctor }) => {
  const [specialties, setSpecialties] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const isEditing = Boolean(doctor);

  const form = useForm({
    resolver: zodResolver(
      isEditing
        ? doctorSchema.extend({ password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')) })
        : doctorSchema
    ),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      specialty: '',
      license_number: '',
      avatar_url: '',
      is_active: true,
    },
  });

  // Load specialties when modal opens
  useEffect(() => {
    if (open) {
      userService
        .getSpecialties()
        .then(setSpecialties)
        .catch(() => toast.error('Error al cargar especialidades'));
    }
  }, [open]);

  // Reset form when modal opens/closes or doctor changes
  useEffect(() => {
    if (open) {
      if (doctor) {
        form.reset({
          username: doctor.username || '',
          email: doctor.email || '',
          first_name: doctor.first_name || '',
          last_name: doctor.last_name || '',
          phone: doctor.phone || '',
          password: '',
          specialty: doctor.specialty || '',
          license_number: doctor.license_number || '',
          avatar_url: doctor.avatar_url || '',
          is_active: doctor.is_active !== false,
        });
      } else {
        form.reset({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          password: '',
          specialty: '',
          license_number: '',
          avatar_url: '',
          is_active: true,
        });
      }
      setServerError(null);
    }
  }, [open, doctor, form]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);

    try {
      // Remove empty optional fields before sending
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      if (!payload.license_number) delete payload.license_number;
      if (!payload.avatar_url) delete payload.avatar_url;

      if (isEditing) {
        await userService.updateDoctor(doctor.id, payload);
        toast.success('Doctor actualizado', {
          description: `Los datos de ${data.first_name} ${data.last_name} fueron guardados.`,
        });
      } else {
        await userService.createDoctor(payload);
        toast.success('Doctor creado', {
          description: `${data.first_name} ${data.last_name} fue añadido al equipo.`,
        });
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Doctor' : 'Añadir Doctor'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modificá los datos del doctor. Dejá la contraseña vacía para no cambiarla.'
              : 'Completá los datos para registrar un nuevo doctor en la clínica.'}
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

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="juan.perez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="juan@clinica.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* First name + Last name (2 columns) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 11 1234-5678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? 'Contraseña (opcional)' : 'Contraseña'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditing ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specialty (Select) */}
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidad</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar especialidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* License number */}
            <FormField
              control={form.control}
              name="license_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matrícula (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="MP-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Avatar (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/foto.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* is_active Switch */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <FormLabel className="text-xs font-medium cursor-pointer">Activo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar Cambios'
                    : 'Crear Doctor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorFormModal;
