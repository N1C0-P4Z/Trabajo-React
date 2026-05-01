require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

const app = express();

// CORS configuration - allow frontend to send cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Protected example route
app.get('/api/protected', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'This is protected data', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  // Errores de validación del user service (400 Bad Request)
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
    'Username/email and password are required'
  ];

  if (validationErrors.some(msg => err.message.includes(msg) || err.message === msg)) {
    return res.status(400).json({ error: err.message });
  }

  // Errores de unicidad / conflicto (409 Conflict)
  if (err.message.includes('ya está en uso')) {
    return res.status(409).json({ error: err.message });
  }

  // Errores de autenticación (401 Unauthorized)
  if (err.message === 'Invalid credentials') {
    return res.status(401).json({ error: err.message });
  }

  if (err.message === 'Unauthorized' || err.message === 'User not found') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Errores de autorización (403 Forbidden)
  if (err.message === 'No autorizado para editar este usuario') {
    return res.status(403).json({ error: err.message });
  }

  // Errores de no encontrado (404 Not Found)
  if (err.message === 'Usuario no encontrado') {
    return res.status(404).json({ error: err.message });
  }

  // Error genérico
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
