/**
 * @fileoverview Modal (dialog) para crear o editar usuarios desde el panel de administración.
 * Solo accesible por SUPER_ADMIN y OWNER. OWNER no puede asignar SUPER_ADMIN.
 * Cambiar contraseña (solo al crear) y activar/desactivar usuarios.
 * 
 * Exporta también {@link ROLE_OPTIONS} y {@link ROLE_LABELS} para reutilizar
 * en otros componentes.
 */

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';
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

/**
 * Lista de roles disponibles para crear/editar usuarios.
 * @type {Array<{value: string, label: string}>}
 */
const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'OWNER', label: 'Owner' },
  { value: 'DENTIST', label: 'Dentista' },
  { value: 'SECRETARY', label: 'Secretaria' },
  { value: 'PATIENT', label: 'Paciente' },
];

/**
 * Mapeo de roles a sus etiquetas legibles.
 * @type {Object<string, string>}
 */
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
  role: z.string().min(1, 'Seleccioná un rol'),
  is_active: z.boolean().default(true),
});

// --- Component ---

/**
 * Modal para crear o editar usuarios del sistema.
 * Si recibe la prop `user` se abre en modo edición (sin campo de contraseña).
 * Si no recibe `user`, se abre en modo creación (con campo de contraseña).
 * 
 * @param {Object} props
 * @param {boolean} props.open - Si el modal está abierto o cerrado
 * @param {(open: boolean) => void} props.onOpenChange - Función para cambiar el estado de apertura
 * @param {() => void} [props.onSuccess] - Callback que se ejecuta después de crear/editar exitosamente
 * @param {Object} [props.user] - Datos del usuario a editar (si no se pasa, se crea uno nuevo)
 * @param {number} props.user.id
 * @param {string} props.user.username
 * @param {string} props.user.email
 * @param {string} props.user.first_name
 * @param {string} props.user.last_name
 * @param {string} props.user.phone
 * @param {string} props.user.role
 * @param {boolean} props.user.is_active
 * @returns {JSX.Element}
 * 
 * @example
 * <UserFormModal
 *   open={modalOpen}
 *   onOpenChange={setModalOpen}
 *   onSuccess={() => recargarUsuarios()}
 *   user={usuarioAEditar}   // opcional, si no se pasa se crea
 * />
 */
const UserFormModal = ({ open, onOpenChange, onSuccess, user }) => {
  const { user: actor } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const isEditing = Boolean(user);
  const roleOptions = actor?.role === 'SUPER_ADMIN'
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((opt) => opt.value !== 'SUPER_ADMIN');

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

  useEffect(() => {
    if (open) {
      if (user) {
        form.reset({
          username: user.username || '',
          email: user.email || '',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
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
              ? 'Modificá los datos del usuario.'
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

            {/* Password — only for new users */}
            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                      {roleOptions.map((opt) => (
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

            {/* Estado */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === 'true')}
                    value={field.value ? 'true' : 'false'}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Activo</SelectItem>
                      <SelectItem value="false">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
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