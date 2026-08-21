import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import SecretaryCard from '../components/SecretaryCard';
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

const SecretariesPage = () => {
  const [secretaries, setSecretaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSecretary, setDeletingSecretary] = useState(null);

  const loadSecretaries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getSecretaries();
      setSecretaries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSecretaries();
  }, [loadSecretaries]);

  const handleToggleActive = async (secretary) => {
    try {
      const newStatus = !(secretary.is_active !== false);
      await userService.updateUser(secretary.id, { is_active: newStatus });
      toast.success(
        newStatus ? 'Secretaria activada' : 'Secretaria desactivada',
        {
          description: `${secretary.first_name} ${secretary.last_name} ahora está ${newStatus ? 'activa' : 'inactiva'}.`,
        }
      );
      loadSecretaries();
    } catch (err) {
      toast.error('Error', { description: err.message });
    }
  };

  const handleDeleteClick = (secretary) => {
    setDeletingSecretary(secretary);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSecretary) return;

    try {
      await userService.deleteUser(deletingSecretary.id);
      toast.success('Secretaria eliminada', {
        description: `${deletingSecretary.first_name} ${deletingSecretary.last_name} fue eliminada del sistema.`,
      });
      setDeleteDialogOpen(false);
      setDeletingSecretary(null);
      loadSecretaries();
    } catch (err) {
      toast.error('Error', { description: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Secretarias</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Secretarias</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestioná el equipo de secretarias de la clínica
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground mt-3">Cargando secretarias...</p>
        </div>
      )}

      {!loading && !error && secretaries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay secretarias registradas.</p>
        </div>
      )}

      {!loading && !error && secretaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {secretaries.map((secretary) => (
            <SecretaryCard
              key={secretary.id}
              secretary={secretary}
              onToggleActive={() => handleToggleActive(secretary)}
              onDelete={() => handleDeleteClick(secretary)}
            />
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Secretaria</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que querés eliminar a{' '}
              <span className="font-medium text-foreground">
                {deletingSecretary?.first_name} {deletingSecretary?.last_name}
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

export default SecretariesPage;
