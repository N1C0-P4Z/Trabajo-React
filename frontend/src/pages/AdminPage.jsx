import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import statsService from '../services/statsService';
import userService from '../services/userService';
import UserFormModal, { ROLE_LABELS } from '../components/UserFormModal';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';

const kpiConfig = [
  { key: 'totalPatients', label: 'Pacientes', icon: Users, color: 'text-blue-500' },
  { key: 'totalDoctors', label: 'Dentistas', icon: Stethoscope, color: 'text-emerald-500' },
  { key: 'todayAppointments', label: 'Turnos hoy', icon: Calendar, color: 'text-amber-500' },
  { key: 'pendingAppointments', label: 'Pendientes', icon: Clock, color: 'text-orange-500' },
  { key: 'monthlyIncome', label: 'Ingresos', icon: DollarSign, color: 'text-violet-500', placeholder: true },
];

const ROLE_BADGE_VARIANTS = {
  SUPER_ADMIN: 'default',
  OWNER: 'default',
  DENTIST: 'secondary',
  SECRETARY: 'outline',
  PATIENT: 'secondary',
};

const AdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // User table state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // --- Stats loading ---
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await statsService.getStats();
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // --- User table loading ---
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // --- Handlers ---

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormModalOpen(true);
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (userToDelete) => {
    setDeletingUser(userToDelete);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await userService.deleteUser(deletingUser.id);
      setDeleteDialogOpen(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      // Error shown in dialog
      setUsersError(err.message);
      setDeleteDialogOpen(false);
    }
  };

  const handleFormSuccess = () => {
    loadUsers();
  };

  const formatValue = (key, value) => {
    if (key === 'monthlyIncome') {
      if (value === 0 || value === null) return 'No disponible';
      return `$${value.toLocaleString('es-AR')}`;
    }
    return value ?? 0;
  };

  const getRoleBadge = (role) => {
    const variant = ROLE_BADGE_VARIANTS[role] || 'secondary';
    const label = ROLE_LABELS[role] || role;
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general del sistema
        </p>
      </div>

      {statsError && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {statsError}
        </div>
      )}

      {/* Main KPI cards — 4-column grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiConfig.slice(0, 4).map(({ key, label, icon: Icon, color }) => {
          const value = stats?.[key];

          return (
            <Card key={key} className="py-4">
              <CardHeader>
                <CardDescription className="text-sm">{label}</CardDescription>
                <CardTitle>
                  <span className={`flex items-center gap-3 ${color}`}>
                    <Icon className="size-8" />
                    <span className="text-3xl">
                      {statsLoading ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        formatValue(key, value)
                      )}
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Income card — full width below */}
      <div className="grid grid-cols-1 gap-4">
        {(() => {
          const { key, label, icon: Icon, color, placeholder } = kpiConfig[4];
          const value = stats?.[key];
          const isPlaceholder = placeholder && (value === 0 || value === null);

          return (
            <Card key={key} className="py-4">
              <CardHeader>
                <CardDescription className="text-sm">{label}</CardDescription>
                <CardTitle>
                  <span className={`flex items-center gap-3 ${color}`}>
                    <Icon className="size-8" />
                    <span className="text-3xl">
                      {statsLoading ? (
                        <span className="text-muted-foreground">—</span>
                      ) : isPlaceholder ? (
                        <span className="text-muted-foreground text-base">No disponible</span>
                      ) : (
                        formatValue(key, value)
                      )}
                    </span>
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })()}
      </div>

      {/* User Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
          <Button size="default" className="px-5 py-5 text-base font-semibold" onClick={handleCreateUser}>
            <Plus className="size-5 mr-1.5" />
            Crear Usuario
          </Button>
        </div>

        {usersError && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
            {usersError}
          </div>
        )}

        {/* Loading state */}
        {usersLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground mt-3">Cargando usuarios...</p>
          </div>
        )}

        {/* Table */}
        {!usersLoading && users.length > 0 && (
          <div className="rounded-xl border border-border">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground">
              <div className="col-span-2">Usuario</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Nombre completo</div>
              <div className="col-span-2">Rol</div>
              <div className="col-span-2">Teléfono</div>
              <div className="col-span-1 text-right">Acciones</div>
            </div>

            {/* Data rows */}
            {users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border/50 hover:bg-muted/30 transition-colors group last:border-b-0 items-center"
              >
                <div className="col-span-2 text-sm text-foreground truncate font-medium">
                  {u.username}
                </div>
                <div className="col-span-3 text-sm text-foreground truncate">
                  {u.email}
                </div>
                <div className="col-span-2 text-sm text-foreground truncate">
                  {u.first_name} {u.last_name}
                </div>
                <div className="col-span-2">
                  {getRoleBadge(u.role)}
                </div>
                <div className="col-span-2 text-sm text-foreground truncate">
                  {u.phone || '—'}
                </div>
                <div className="col-span-1 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEditUser(u)}
                    title="Editar usuario"
                    className="size-7"
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteClick(u)}
                    title="Eliminar usuario"
                    className="size-7 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!usersLoading && users.length === 0 && !usersError && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay usuarios registrados.</p>
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      <UserFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSuccess={handleFormSuccess}
        user={editingUser}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a{' '}
              <span className="font-medium text-foreground">
                {deletingUser?.first_name} {deletingUser?.last_name}
              </span>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;