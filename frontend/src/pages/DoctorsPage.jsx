import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import DoctorCard from '../components/DoctorCard';
import DoctorFormModal from '../components/DoctorFormModal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const DoctorsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER';
  const isSecretary = user?.role === 'SECRETARY';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDoctor, setDeletingDoctor] = useState(null);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getDoctors();
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    setFormModalOpen(true);
  };

  const handleToggleActive = async (doctor) => {
    try {
      const newStatus = !(doctor.is_active !== false);
      await userService.updateDoctor(doctor.id, { is_active: newStatus });
      toast.success(
        newStatus ? 'Doctor activado' : 'Doctor desactivado',
        {
          description: `${doctor.first_name} ${doctor.last_name} ahora está ${newStatus ? 'activo' : 'inactivo'}.`,
        }
      );
      loadDoctors();
    } catch (err) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleDeleteClick = (doctor) => {
    setDeletingDoctor(doctor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDoctor) return;

    try {
      await userService.deleteUser(deletingDoctor.id);
      toast.success('Doctor eliminado', {
        description: `${deletingDoctor.first_name} ${deletingDoctor.last_name} fue eliminado del sistema.`,
      });
      setDeleteDialogOpen(false);
      setDeletingDoctor(null);
      loadDoctors();
    } catch (err) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleFormSuccess = () => {
    loadDoctors();
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dentistas</BreadcrumbPage>

          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dentistas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestioná el equipo de dentistas de la clínica
          </p>
        </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground mt-3">Cargando doctores...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && doctors.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay doctores registrados.</p>
        </div>
      )}

      {/* Grid of DoctorCards */}
      {!loading && !error && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onToggleActive={() => handleToggleActive(doctor)}
              onDelete={() => handleDeleteClick(doctor)}
              hideActions={isSecretary}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <DoctorFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSuccess={handleFormSuccess}
        doctor={editingDoctor}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Doctor</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a{' '}
              <span className="font-medium text-foreground">
                {deletingDoctor?.first_name} {deletingDoctor?.last_name}
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

export default DoctorsPage;
