import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

const DoctorCard = ({ doctor, onToggleActive, onDelete }) => {
  const navigate = useNavigate();
  const isActive = doctor.is_active !== false; // default true
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleAction = (action) => {
    setMenuOpen(false);
    action();
  };

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-6 transition-all',
        !isActive && 'opacity-60'
      )}
    >
      {/* Header: Avatar + Menu */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={doctor.avatar_url} alt={`${doctor.first_name} ${doctor.last_name}`} />
            <AvatarFallback>{getInitials(doctor.first_name, doctor.last_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {doctor.first_name} {doctor.last_name}
            </h3>
            {doctor.specialty && (
              <p className="text-xs text-muted-foreground mt-0.5">{doctor.specialty}</p>
            )}
          </div>
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-36 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
              <button
                className="flex w-full min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-hidden hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleAction(onToggleActive)}
              >
                {isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                className="flex w-full min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-xs outline-hidden hover:bg-destructive/10 hover:text-destructive text-destructive"
                onClick={() => handleAction(onDelete)}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body: Details */}
      <div className="space-y-2 mb-4">
        {doctor.license_number && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Matrícula:</span>
            <span className="text-foreground font-medium">{doctor.license_number}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Email:</span>
          <span className="text-foreground truncate">{doctor.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Teléfono:</span>
          <span className="text-foreground">{doctor.phone}</span>
        </div>
      </div>

      {/* Footer: Status Badge + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
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

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!isActive}
            onClick={() => navigate(`/appointments?doctorId=${doctor.id}`)}
            title="Ver Agenda"
          >
            <Calendar className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(`/doctors/${doctor.id}`)}
            title="Ver Perfil"
          >
            <User className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
