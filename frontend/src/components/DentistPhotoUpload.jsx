/**
 * @fileoverview Componente de carga de foto de perfil para DENTIST.
 * Permite seleccionar y subir una imagen (PNG/JPEG, máx 2MB).
 * Wired to POST /v1/users/me/photo.
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, Loader2, User } from 'lucide-react';
import { authService } from '../services/authService';
import { API_BASE } from '../services/apiConfig';

const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

/**
 * Componente de carga de foto para dentistas.
 *
 * @param {Object} props
 * @param {Object} props.user - Usuario actual (debe tener avatar_url si ya tiene foto)
 * @param {Function} [props.onUploadSuccess] - Callback tras subida exitosa (recibe { avatar_url })
 * @returns {JSX.Element}
 */
const DentistPhotoUpload = ({ user, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const avatarSrc = previewUrl || (user?.avatar_url ? `${API_BASE}${user.avatar_url}` : null);
  const initials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato no válido', {
        description: 'Solo se permiten archivos PNG y JPEG.',
      });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Archivo muy grande', {
        description: 'El tamaño máximo permitido es 2MB.',
      });
      return;
    }

    setUploading(true);

    try {
      const result = await authService.uploadPhoto(file);
      setPreviewUrl(null); // Clear preview, use server URL
      toast.success('Foto actualizada', {
        description: 'Tu foto de perfil se actualizó correctamente.',
      });
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      toast.error('Error al subir foto', {
        description: err.message || 'No se pudo subir la foto.',
      });
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar size="lg" className="size-24">
        {avatarSrc ? (
          <AvatarImage src={avatarSrc} alt="Foto de perfil" />
        ) : null}
        <AvatarFallback className="text-lg">
          {initials || <User className="size-8" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
          id="dentist-photo-input"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Subiendo...
            </>
          ) : (
            <>
              <Camera className="size-4 mr-2" />
              Cambiar foto
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          PNG o JPEG, máx. 2MB
        </p>
      </div>
    </div>
  );
};

export default DentistPhotoUpload;
