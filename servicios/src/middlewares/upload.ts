import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = ['.png', '.jpeg', '.jpg'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];

const MAGIC_BYTES = {
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
};

const UPLOAD_TEMP_DIR = path.join(__dirname, '../../uploads/temp');
export const UPLOAD_FINAL_DIR = path.join(__dirname, '../../uploads/avatars');

export function isSafeAvatarPath(resolvedPath: string): boolean {
  const normalized = path.resolve(resolvedPath);
  const avatarsDir = path.resolve(UPLOAD_FINAL_DIR);

  if (normalized.includes('..')) {
    return false;
  }

  return normalized === avatarsDir || normalized.startsWith(`${avatarsDir}${path.sep}`);
}

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_FINAL_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await ensureDirectories();
      cb(null, UPLOAD_TEMP_DIR);
    } catch (err) {
      cb(err as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new Error('INVALID_EXTENSION'));
      return;
    }
    cb(null, true);
  },
});

function detectImageExt(buffer: Buffer): '.png' | '.jpg' | null {
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(MAGIC_BYTES.png)) {
    return '.png';
  }
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(MAGIC_BYTES.jpeg)) {
    return '.jpg';
  }
  return null;
}

async function cleanupTemp(filePath: string | undefined): Promise<void> {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // ya borrado
  }
}

/**
 * Subida de foto: máx 2MB, mime/extensión y magic bytes.
 * Sin sharp (evita binarios nativos que fallan en el server de la facultad).
 */
export function handlePhotoUpload(req: Request, res: Response, next: NextFunction): void {
  const multerSingle = upload.single('photo');

  multerSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        await cleanupTemp(req.file?.path);
        res.status(400).json({ error: 'Archivo demasiado grande. Máximo 2MB.' });
        return;
      }
      await cleanupTemp(req.file?.path);
      res.status(400).json({ error: `Error de subida: ${err.message}` });
      return;
    }

    if (err && err.message === 'INVALID_EXTENSION') {
      await cleanupTemp(req.file?.path);
      res.status(400).json({ error: 'Tipo de archivo inválido. Solo PNG y JPEG.' });
      return;
    }

    if (err) {
      await cleanupTemp(req.file?.path);
      res.status(400).json({ error: err.message || 'Error al subir el archivo' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No se envió ningún archivo (campo "photo").' });
      return;
    }

    const tempPath = req.file.path;

    try {
      if (req.file.size > MAX_FILE_SIZE) {
        await cleanupTemp(tempPath);
        res.status(400).json({ error: 'Archivo demasiado grande. Máximo 2MB.' });
        return;
      }

      const fileBuffer = await fs.readFile(tempPath);
      const ext = detectImageExt(fileBuffer);
      if (!ext) {
        await cleanupTemp(tempPath);
        res.status(400).json({ error: 'El contenido del archivo no es un PNG o JPEG válido.' });
        return;
      }

      await ensureDirectories();
      const filename = `avatar-${(req as any).user.userId}-${Date.now()}${ext}`;
      const finalPath = path.join(UPLOAD_FINAL_DIR, filename);

      await fs.rename(tempPath, finalPath);

      (req as any).processedPhoto = {
        path: finalPath,
        filename,
        avatar_url: `/uploads/avatars/${filename}`,
      };

      next();
    } catch (processingError) {
      await cleanupTemp(tempPath);
      console.error('Error al procesar imagen:', processingError);
      res.status(400).json({ error: 'No se pudo guardar la imagen.' });
    }
  });
}
