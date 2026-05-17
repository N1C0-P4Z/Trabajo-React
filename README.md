# Odonto Manager — Sistema de Gestión Odontológica

Sistema completo para consultorios odontológicos. Frontend React + Backend Node.js/TypeScript + SQLite.

**Integrantes:** Nicolás Paz Reyes, Martin Moloeznik, Santiago Cañal.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS v3, shadcn/ui |
| Backend | Node.js 22, TypeScript 5, Express 4, Prisma 5 |
| DB | SQLite (archivo local) |
| Deploy | SCP + PM2 (Guía Schujman 2026) |

---

## Arranque local

### Backend (`servicios/`)

```bash
cd servicios
npm install
npx prisma generate
npx prisma migrate dev        # crear tablas en SQLite
node prisma/seed.js           # usuario admin (admin / secret123)
npm run build && npm start    # compila TS → dist/ y arranca en :3001

# Desarrollo con autoreload:
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

Login: **admin** / **secret123**

---

## API Endpoints (`/v1/...`)

| Método | Endpoint | Auth |
|---|---|---|
| POST | `/v1/auth/login` | No |
| POST | `/v1/auth/logout` | Sí |
| GET | `/v1/auth/me` | Sí |
| POST | `/v1/users` | No |
| GET | `/v1/users` | Sí |
| GET | `/v1/users/:id` | Sí |
| PUT | `/v1/users/:id` | Sí |
| DELETE | `/v1/users/:id` | Sí |

---

## Deploy (Guía Schujman)

```bash
# Compilar
(cd servicios && npm run build)
(cd frontend && VITE_BASE='/~dos/' npm run build)

# Subir
scp -r frontend/dist/* dos@200.3.127.46:~/public_html/
scp -r servicios/dist/* dos@200.3.127.46:~/servicios/dist/
scp -r servicios/prisma/* dos@200.3.127.46:~/servicios/prisma/
```

PM2 detecta cambios en `dist/` y reinicia automáticamente.

---

## Estructura

```
Trabajo-React/
├── servicios/          # Backend TypeScript → CommonJS
│   ├── src/            # Código fuente .ts
│   ├── dist/           # Compilado (npm run build)
│   ├── prisma/         # Schema SQLite + migraciones
│   └── tsconfig.json   # module: commonjs, strict: true
└── frontend/           # React + Vite
    └── src/
```

Ver [`AGENTS.md`](./AGENTS.md) para documentación completa.
