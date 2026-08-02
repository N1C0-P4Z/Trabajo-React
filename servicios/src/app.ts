import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import routes from './routes';
import { AppError } from './utils/errors';
import { BODY_SIZE_LIMIT } from './config/security';

const app = express();

// Security headers (Helmet)
app.use(helmet());

// Disable x-powered-by
app.disable('x-powered-by');

// CORS — permite cookies cross-origin para desarrollo local
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with size limit
app.use(express.json({ limit: BODY_SIZE_LIMIT }));
app.use(cookieParser());

// Static file serving for uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes — sin prefijo /api (el proxy inverso del servidor lo maneja)
// En el servidor: /~USUARIO/api/*  →  /*  (backend)
// En local:      http://localhost:3001/v1/...
app.use('/', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);

  // Payload Too Large (express.json limit)
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large. Maximum body size is 1MB.' });
    return;
  }

  // AppError: structured error with statusCode and optional field
  if (err instanceof AppError) {
    const body: any = { error: err.message };
    if (err.field) body.field = err.field;
    res.status(err.statusCode).json(body);
    return;
  }

  // Legacy validation errors (strings thrown by services not yet migrated)
  const validationErrors = [
    'Campos requeridos faltantes para el turno',
    'Rango de fechas inválido (start > end)',
    'Rango de fechas inválido (formato incorrecto)',
    'Rango de fechas inválido',
    'El nombre del tipo de turno es requerido',
    'El nombre del tipo de turno no puede estar vacío',
    'ID de tipo de turno inválido',
    'ID de turno inválido',
    'Fecha y hora inválidas',
    'Estado inválido',
    'Los parámetros start y end son requeridos',
    'No hay datos para actualizar',
    'ID de usuario inválido',
    'ID de paciente inválido',
  ];

  if (validationErrors.some(msg => err.message.includes(msg) || err.message === msg)) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message.includes('ya está en uso') ||
      err.message.includes('ya está registrado') ||
      err.message.includes('no está disponible') ||
      err.message === 'Ya existe un tipo de turno con ese nombre') {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err.message === 'Invalid credentials') {
    res.status(401).json({ error: err.message });
    return;
  }

  if (err.message === 'Unauthorized' || err.message === 'User not found') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (err.message === 'No autorizado para editar este usuario' ||
      err.message === 'No autorizado para eliminar usuarios' ||
      err.message === 'No se puede eliminar al administrador del sistema' ||
      err.message === 'No se puede eliminar al último SUPER_ADMIN del sistema' ||
      err.message === 'No podés eliminar tu propia cuenta' ||
      err.message === 'No autorizado para gestionar tipos de turno' ||
      err.message === 'No autorizado para gestionar doctores' ||
      err.message === 'No autorizado para gestionar pacientes') {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err.message === 'Usuario no encontrado' ||
      err.message === 'Tipo de turno no encontrado' ||
      err.message === 'Turno no encontrado' ||
      err.message === 'Paciente no encontrado' ||
      err.message === 'Doctor no encontrado') {
    res.status(404).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
