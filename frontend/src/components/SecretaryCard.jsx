import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAvatarObjectUrl, revokeAvatarObjectUrl } from '../services/avatarService';

function getInitials(firstName, lastName) {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
}

const SecretaryCard = ({ secretary, onToggleActive, onDelete }) => {
  const navigate = useNavigate();
  const isActive = secretary.is_active !== false;
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState(null);
  const menuRef = useRef(null);

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

    loadAvatar();

    return () => {
      cancelled = true;
      revokeAvatarObjectUrl(loadedUrl);
    };
  }, [secretary?.id, secretary?.avatar_url]);

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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            {avatarObjectUrl ? (
              <AvatarImage
                src={avatarObjectUrl}
                alt={`${secretary.first_name} ${secretary.last_name}`}
              />
            ) : null}
            <AvatarFallback>{getInitials(secretary.first_name, secretary.last_name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {secretary.first_name} {secretary.last_name}
            </h3>
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

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Email:</span>
          <span className="text-foreground truncate">{secretary.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Teléfono:</span>
          <span className="text-foreground">{secretary.phone}</span>
        </div>
      </div>

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
            onClick={() => navigate(`/secretaries/${secretary.id}`)}
            title="Ver Perfil"
          >
            <User className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecretaryCard;
