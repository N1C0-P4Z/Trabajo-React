import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { fetchAvatarObjectUrl, revokeAvatarObjectUrl } from '../services/avatarService';
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

const SecretaryProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [secretary, setSecretary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState(null);

  const loadSecretary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserById(id);
      if (data.role !== 'SECRETARY') {
        setSecretary(null);
        setError('Secretaria no encontrada');
        return;
      }
      setSecretary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSecretary();
  }, [loadSecretary]);

  useEffect(() => {
    let cancelled = false;
    let loadedUrl = null;

    async function loadAvatar() {
      if (!secretary?.id || !secretary?.avatar_url) {
        setAvatarObjectUrl((prev) => {
          revokeAvatarObjectUrl(prev);
          return null;
        });
        return;
      }

      const objectUrl = await fetchAvatarObjectUrl(secretary.id);
      if (cancelled) {
        revokeAvatarObjectUrl(objectUrl);
        return;
      }

      loadedUrl = objectUrl;
      setAvatarObjectUrl((prev) => {
        revokeAvatarObjectUrl(prev);
        return objectUrl;
      });
    }

    if (secretary) {
      loadAvatar();
    }

    return () => {
      cancelled = true;
      revokeAvatarObjectUrl(loadedUrl);
    };
  }, [secretary?.id, secretary?.avatar_url]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground mt-3">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !secretary) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">
          {error || 'Secretaria no encontrada'}
        </p>
        <Button variant="outline" onClick={() => navigate('/secretaries')}>
          Volver a Secretarias
        </Button>
      </div>
    );
  }

  const isActive = secretary.is_active !== false;

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
            <BreadcrumbLink asChild>
              <Link to="/secretaries">Secretarias</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {secretary.first_name} {secretary.last_name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar size="lg" className="size-20 text-lg">
            {avatarObjectUrl ? (
              <AvatarImage
                src={avatarObjectUrl}
                alt={`${secretary.first_name} ${secretary.last_name}`}
              />
            ) : null}
            <AvatarFallback className="text-xl">
              {getInitials(secretary.first_name, secretary.last_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground">
              {secretary.first_name} {secretary.last_name}
            </h1>
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

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/secretaries')}>
              Volver
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Información</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="text-sm text-foreground mt-0.5">{secretary.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Teléfono</dt>
            <dd className="text-sm text-foreground mt-0.5">{secretary.phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">DNI</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {secretary.dni || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Dirección</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {secretary.direccion || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Rol</dt>
            <dd className="text-sm text-foreground mt-0.5">{secretary.role}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Fecha de registro</dt>
            <dd className="text-sm text-foreground mt-0.5">
              {formatDate(secretary.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Nombre de usuario</dt>
            <dd className="text-sm text-foreground mt-0.5">{secretary.username}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default SecretaryProfilePage;
