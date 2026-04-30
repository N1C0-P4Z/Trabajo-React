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

  // Errores conocidos del auth service
  if (err.message === 'Username and password are required') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === 'Invalid credentials') {
    return res.status(401).json({ error: err.message });
  }

  if (err.message === 'Unauthorized' || err.message === 'User not found') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Error genérico
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
