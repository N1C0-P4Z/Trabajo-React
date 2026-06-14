import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

const DoctorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDoctor = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserById(id);
      setDoctor(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  // Loading
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground mt-3">Cargando perfil...</p>
      </div>
    );
  }

  // Error or not found
  if (error || !doctor) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          {error || 'Doctor no encontrado.'}
        </p>
        <Button variant="outline" onClick={() => navigate('/dentists')}>
          Volver a Dentistas
        </Button>
      </div>
    );
  }

  const isActive = doctor.is_active !== false;

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
            <BreadcrumbLink asChild>
              <Link to="/dentists">Dentistas</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {doctor.first_name} {doctor.last_name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <Avatar size="lg" className="size-20 text-lg">
            <AvatarImage src={doctor.avatar_url} alt={`${doctor.first_name} ${doctor.last_name}`} />
            <AvatarFallback className="text-xl">
              {getInitials(doctor.first_name, doctor.last_name)}
            </AvatarFallback>
          </Avatar>

          {/* Name & Specialty */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">
              {doctor.first_name} {doctor.last_name}
            </h1>
            {doctor.specialty && (
              <p className="text-sm text-muted-foreground mt-1">{doctor.specialty}</p>
            )}
            <div className="mt-3">
              <Badge
                variant={isActive ? 'default' : 'secondary'}
                className={
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                    : ''
                }
              >
                {isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/appointments?doctorId=${doctor.id}`)}
              disabled={!isActive}
            >
              Ver Agenda
            </Button>
            <Button variant="outline" onClick={() => navigate('/dentists')}>
              Volver
            </Button>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Información</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="text-sm text-foreground mt-0.5">{doctor.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Teléfono</dt>
            <dd className="text-sm text-foreground mt-0.5">{doctor.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Matrícula</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {doctor.license_number || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Rol</dt>
            <dd className="text-sm text-foreground mt-0.5">{doctor.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Fecha de registro</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {formatDate(doctor.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Nombre de usuario</dt>
            <dd className="text-sm text-foreground mt-0.5">{doctor.username}</dd>
          </div>
        </dl>
      </div>

      {/* Upcoming Appointments (Placeholder) */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Próximos turnos</h2>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            La agenda de turnos estará disponible próximamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
