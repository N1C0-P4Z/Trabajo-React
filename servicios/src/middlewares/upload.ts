import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = ['.png', '.jpeg', '.jpg'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];

const MAGIC_BYTES = {
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),
};

const UPLOAD_TEMP_DIR = path.join(__dirname, '../../uploads/temp');
const UPLOAD_FINAL_DIR = path.join(__dirname, '../../uploads/avatars');

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

function validateMagicBytes(buffer: Buffer): boolean {
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(MAGIC_BYTES.png)) {
    return true;
  }
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(MAGIC_BYTES.jpeg)) {
    return true;
  }
  return false;
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
 * Subida de foto: tamaño máx 2MB, extensión/mime, magic bytes y normalización con Sharp.
 * Deja el resultado en req.processedPhoto.
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
      if (!validateMagicBytes(fileBuffer)) {
        await cleanupTemp(tempPath);
        res.status(400).json({ error: 'El contenido del archivo no es un PNG o JPEG válido.' });
        return;
      }

      await ensureDirectories();
      const filename = `avatar-${(req as any).user.userId}-${Date.now()}.webp`;
      const finalPath = path.join(UPLOAD_FINAL_DIR, filename);

      await sharp(tempPath)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(finalPath);

      await cleanupTemp(tempPath);

      (req as any).processedPhoto = {
        path: finalPath,
        filename,
        avatar_url: `/uploads/avatars/${filename}`,
      };

      next();
    } catch (processingError) {
      await cleanupTemp(tempPath);
      console.error('Error al procesar imagen:', processingError);
      res.status(400).json({ error: 'No se pudo procesar la imagen. El archivo puede estar dañado.' });
    }
  });
}
