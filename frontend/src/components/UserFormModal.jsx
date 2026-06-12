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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Constants ---

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'DENTIST', label: 'Dentista' },
  { value: 'SECRETARY', label: 'Secretaria' },
  { value: 'PATIENT', label: 'Paciente' },
];

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  OWNER: 'Owner',
  DENTIST: 'Dentista',
  SECRETARY: 'Secretaria',
  PATIENT: 'Paciente',
};

// --- Schema ---

const createUserSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30),
  email: z.string().email('Email inválido'),
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  phone: z.string().min(6, 'Teléfono inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.string().min(1, 'Seleccioná un rol'),
  is_active: z.boolean().default(true),
});

const editUserSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(30),
  email: z.string().email('Email inválido'),
  first_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  last_name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  phone: z.string().min(6, 'Teléfono inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.string().min(1, 'Seleccioná un rol'),
  is_active: z.boolean().default(true),
});

// --- Component ---

const UserFormModal = ({ open, onOpenChange, onSuccess, user }) => {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const isEditing = Boolean(user);

  const form = useForm({
    resolver: zodResolver(isEditing ? editUserSchema : createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      password: '',
      role: 'PATIENT',
      is_active: true,
    },
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          username: user.username || '',
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          password: '',
          role: user.role || 'PATIENT',
          is_active: user.is_active !== false,
        });
      } else {
        form.reset({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          password: '',
          role: 'PATIENT',
          is_active: true,
        });
      }
      setServerError(null);
    }
  }, [open, user, form]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const payload = { ...data };
      // Remove empty password on edit
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      if (isEditing) {
        await userService.updateUser(user.id, payload);
        toast.success('Usuario actualizado', {
          description: `Los datos de ${data.first_name} ${data.last_name} fueron guardados.`,
        });
      } else {
        await userService.createUser(payload);
        toast.success('Usuario creado', {
          description: `${data.first_name} ${data.last_name} fue registrado correctamente.`,
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
          <DialogTitle>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modificá los datos del usuario. Dejá la contraseña vacía para no cambiarla.'
              : 'Completá los datos para registrar un nuevo usuario en el sistema.'}
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

            {/* First name + Last name */}
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

            {/* Role (Select) */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
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
                    : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { ROLE_OPTIONS, ROLE_LABELS };
export default UserFormModal;