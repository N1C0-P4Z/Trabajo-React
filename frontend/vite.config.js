import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  // IMPORTANTE: Cambiar '/~dos/' por tu usuario antes de compilar para el servidor
  // Ej: '/~uno/', '/~tres/', etc.
  // Para desarrollo local dejar como '/' o usar VITE_BASE env var
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    host: '0.0.0.0',
  },
  preview: {
    port: 3000,
    open: true,
  },
})
