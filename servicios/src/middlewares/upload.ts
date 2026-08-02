import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

// ── Constants ─────────────────────────────────────────────────────
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = ['.png', '.jpeg', '.jpg'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg'];

// Magic bytes for file type validation
const MAGIC_BYTES: Record<string, Buffer> = {
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),   // \x89PNG
  jpeg: Buffer.from([0xff, 0xd8, 0xff]),          // ÿØÿ
};

const UPLOAD_TEMP_DIR = path.join(__dirname, '../../uploads/temp');
const UPLOAD_FINAL_DIR = path.join(__dirname, '../../uploads/avatars');

// Ensure directories exist
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(UPLOAD_TEMP_DIR, { recursive: true });
  await fs.mkdir(UPLOAD_FINAL_DIR, { recursive: true });
}

// ── Multer configuration ──────────────────────────────────────────
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

// ── Magic bytes validation ────────────────────────────────────────
function validateMagicBytes(buffer: Buffer): boolean {
  // Check PNG magic bytes
  if (buffer.length >= 4 && buffer.subarray(0, 4).equals(MAGIC_BYTES.png)) {
    return true;
  }
  // Check JPEG magic bytes
  if (buffer.length >= 3 && buffer.subarray(0, 3).equals(MAGIC_BYTES.jpeg)) {
    return true;
  }
  return false;
}

// ── Cleanup helper ────────────────────────────────────────────────
async function cleanupTemp(filePath: string | undefined): Promise<void> {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch {
    // File may already be deleted — ignore
  }
}

// ── Main upload middleware ────────────────────────────────────────
/**
 * Secure image upload middleware.
 * Flow: multer temp → extension check → size check → magic bytes → Sharp decode/normalize → final path.
 * Deletes temp file on every rejection.
 *
 * Exposes req.processedPhoto = { path, filename, avatar_url } on success.
 */
export function handlePhotoUpload(req: Request, res: Response, next: NextFunction): void {
  const multerSingle = upload.single('photo');

  multerSingle(req, res, async (err) => {
    // ── Multer errors ──────────────────────────────────────────
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        await cleanupTemp(req.file?.path);
        res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
        return;
      }
      await cleanupTemp(req.file?.path);
      res.status(400).json({ error: `Upload error: ${err.message}` });
      return;
    }

    // ── Extension filter error ─────────────────────────────────
    if (err && err.message === 'INVALID_EXTENSION') {
      await cleanupTemp(req.file?.path);
      res.status(400).json({ error: 'Invalid file type. Only PNG and JPEG are allowed.' });
      return;
    }

    // ── Other multer errors ────────────────────────────────────
    if (err) {
      await cleanupTemp(req.file?.path);
      res.status(400).json({ error: err.message || 'Upload failed' });
      return;
    }

    // ── No file provided ───────────────────────────────────────
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Use field name "photo".' });
      return;
    }

    const tempPath = req.file.path;

    try {
      // ── Size check (redundant with multer, but defense-in-depth) ──
      if (req.file.size > MAX_FILE_SIZE) {
        await cleanupTemp(tempPath);
        res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
        return;
      }

      // ── Magic bytes check ────────────────────────────────────
      const fileBuffer = await fs.readFile(tempPath);
      if (!validateMagicBytes(fileBuffer)) {
        await cleanupTemp(tempPath);
        res.status(400).json({ error: 'Invalid file content. Magic bytes do not match PNG or JPEG.' });
        return;
      }

      // ── Sharp decode + normalize → final path ────────────────
      await ensureDirectories();
      const filename = `avatar-${(req as any).user.userId}-${Date.now()}.webp`;
      const finalPath = path.join(UPLOAD_FINAL_DIR, filename);

      await sharp(tempPath)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(finalPath);

      // ── Cleanup temp ─────────────────────────────────────────
      await cleanupTemp(tempPath);

      // ── Expose result to downstream handler ──────────────────
      (req as any).processedPhoto = {
        path: finalPath,
        filename,
        avatar_url: `/uploads/avatars/${filename}`,
      };

      next();
    } catch (processingError) {
      await cleanupTemp(tempPath);
      console.error('Image processing failed:', processingError);
      res.status(400).json({ error: 'Image processing failed. File may be corrupted.' });
    }
  });
}
