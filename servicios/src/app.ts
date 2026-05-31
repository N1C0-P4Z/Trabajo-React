import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';

const app = express();

// CORS — permite cookies cross-origin para desarrollo local
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

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

  const validationErrors = [
    'El email es requerido',
    'Formato de email inválido',
    'El nombre de usuario es requerido',
    'El nombre de usuario debe tener al menos 3 caracteres',
    'El nombre de usuario no puede tener más de 30 caracteres',
    'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos',
    'El nombre es requerido',
    'El nombre debe tener al menos 2 caracteres',
    'El nombre no puede tener más de 50 caracteres',
    'El apellido es requerido',
    'El apellido debe tener al menos 2 caracteres',
    'El apellido no puede tener más de 50 caracteres',
    'La contraseña es requerida',
    'La contraseña debe tener al menos 6 caracteres',
    'País no soportado',
    'Formato argentino inválido',
    'El teléfono es requerido',
    'No hay datos para actualizar',
    'ID de usuario inválido',
    'Username/email and password are required',
    // Appointment validation errors
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
    // Doctor-specific validation errors
    'Especialidad no válida',
    'La especialidad es requerida',
    'El número de matrícula es requerido'
  ];

  if (validationErrors.some(msg => err.message.includes(msg) || err.message === msg)) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.message.includes('ya está en uso') || err.message === 'Ya existe un tipo de turno con ese nombre') {
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
      err.message === 'No se puede eliminar a otro administrador' ||
      err.message === 'No autorizado para gestionar tipos de turno' ||
      err.message === 'No autorizado para gestionar doctores') {
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
