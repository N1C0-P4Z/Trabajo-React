# AGENTS.md — Contexto del Proyecto

## 1. Qué es este proyecto

Sistema de gestión para una **clínica odontológica** con autenticación JWT, registro de usuarios, y sidebar con navegación. La base técnica está lista para escalar a módulos de pacientes, doctores, citas, obras sociales y pagos.

**Integrantes:** Nicolás Paz Reyes, Martin Moloeznik, Santiago Cañal.

**Arquitectura:** Siguiendo la [Guía de Deploy Schujman 2026](./GUIA_SCHUJMAN_2026.pdf) — TypeScript compilado a CommonJS, SQLite, deploy por SCP + PM2.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend** | React | 18 |
| | Vite | 5 |
| | Tailwind CSS | v3 |
| | React Router DOM | 6 |
| | shadcn/ui | 4.6 |
| **Backend** | Node.js + TypeScript | 22 / 5.3 |
| | Express | 4 |
| | JWT (jsonwebtoken) | 9 |
| | bcrypt | 5 |
| | Prisma ORM | 5 |
| **Database** | SQLite (archivo `prisma/dev.db`) | — |
| **Deploy** | SCP + PM2 (sin Docker) | — |

---

## 3. Estructura de Directorios

```
Trabajo-React/
├── AGENTS.md
├── GUIA_SCHUJMAN_2026.pdf       # Guía oficial de deploy
├── servicios/                    # BACKEND — TypeScript → CommonJS
│   ├── tsconfig.json            # module: commonjs, outDir: ./dist
│   ├── package.json             # build: tsc, start: node dist/index.js
│   ├── .env                     # Variables locales (no commitear)
│   ├── .env.example
│   ├── .gitignore
│   ├── prisma/
│   │   ├── schema.prisma        # provider: sqlite, User model
│   │   ├── seed.js              # Usuario admin por defecto
│   │   ├── dev.db               # Base SQLite (generada, gitignored)
│   │   └── migrations/          # Migraciones Prisma
│   ├── src/                     # Código fuente TypeScript
│   │   ├── index.ts             # Entry point: app.listen(3001, '0.0.0.0')
│   │   ├── app.ts               # Express config, CORS, error handler
│   │   ├── config/database.ts   # PrismaClient (import CommonJS pattern)
│   │   ├── controllers/         # auth.controller.ts, user.controller.ts
│   │   ├── middlewares/auth.ts  # authenticateToken (cookie-based)
│   │   ├── repositories/user.repository.ts
│   │   ├── routes/              # index.ts → v1/ (auth, users)
│   │   ├── services/            # auth.service.ts, user.service.ts
│   │   └── utils/               # bcrypt.ts, jwt.ts
│   └── dist/                    # JS compilado (npm run build → SCP)
└── frontend/
    ├── package.json
    ├── vite.config.js           # base: env VITE_BASE (default /)
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx             # BrowserRouter con basename dinámico
        ├── App.jsx              # Routes + Sidebar
        ├── services/
        │   ├── apiConfig.js     # API_BASE auto-detect (local vs server)
        │   ├── authService.js
        │   └── userService.js
        ├── components/          # AppSidebar, LoginForm, RegisterForm, etc.
        ├── contexts/            # AuthContext, ThemeContext
        ├── hooks/               # useAuth, use-mobile
        ├── lib/utils.js         # cn() helper
        └── pages/               # Landing, Login, Register, Dashboard
```

---

## 4. Modelo de Datos (Prisma + SQLite)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            Int      @id @default(autoincrement())
  username      String   @unique
  email         String   @unique
  first_name    String
  last_name     String
  phone         String
  password_hash String
  role          String   @default("PATIENT")  // SUPER_ADMIN, OWNER, DENTIST, SECRETARY, PATIENT
  created_at    DateTime @default(now())
}
```

**Nota:** SQLite no tiene enum nativo — Prisma lo maneja como String con validación en cliente.

---

## 5. API Endpoints

El backend escucha en `0.0.0.0:3001` sin prefijo `/api` (el proxy inverso del servidor agrega `/~USUARIO/api`).

### Auth (`/v1/auth`)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | /login | Login con username o email + password |
| POST | /logout | Cerrar sesión (limpia cookie) |
| GET | /me | Obtener usuario actual desde cookie JWT |

### Users (`/v1/users`)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | / | Registrar nuevo usuario |
| GET | / | Listar todos los usuarios |
| GET | /:id | Obtener usuario por ID |
| PUT | /:id | Actualizar usuario |
| DELETE | /:id | Eliminar usuario |

---

## 6. API_BASE — Detección Automática (Frontend)

```js
// frontend/src/services/apiConfig.js
export const API_BASE = window.location.pathname.startsWith('/~')
  ? `/${window.location.pathname.split('/')[1]}/api`
  : 'http://localhost:3001';
```

- **Local:** `API_BASE` = `http://localhost:3001`
- **Servidor:** `API_BASE` = `/~dos/api` (detecta el `~USUARIO` automáticamente)
- Todas las llamadas usan: `fetch(\`${API_BASE}/v1/...\`)` con `credentials: 'include'`

---

## 7. Autenticación: Cookies HTTP-only

- Token JWT en cookie `httpOnly; SameSite=strict; Secure` (secure solo en producción)
- Frontend nunca accede al token → `credentials: 'include'` en todos los fetch
- Backend lee `req.cookies.token`

---

## 8. Comandos Clave

### Backend (servicios/)
```bash
npm install              # Instalar dependencias
npx prisma generate      # Generar Prisma Client
npx prisma migrate dev --name nombre   # Crear migración
npx prisma db push       # Push schema sin migración (desarrollo)
node prisma/seed.js      # Sembrar usuario admin
npm run build            # Compilar TypeScript → dist/
npm start                # Ejecutar backend (node dist/index.js)
npm run dev              # Desarrollo con ts-node
```

### Frontend
```bash
npm install              # Instalar dependencias
npm run dev              # Dev server en localhost:3000
npm run build            # Build producción → dist/
# Para build de deploy: VITE_BASE='/~dos/' npm run build
```

### Deploy (SCP desde la raíz)
```bash
# Compilar
(cd servicios && npm run build)
(cd frontend && VITE_BASE='/~dos/' npm run build)

# Subir frontend
scp -r frontend/dist/* dos@200.3.127.46:~/public_html/

# Subir backend
scp -r servicios/dist/* dos@200.3.127.46:~/servicios/dist/

# Subir migraciones Prisma
scp -r servicios/prisma/* dos@200.3.127.46:~/servicios/prisma/

# PM2 detecta cambios y reinicia automáticamente
```

### Testeo local con curl
```bash
curl -c cookies.txt -X POST http://localhost:3001/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'

curl -b cookies.txt http://localhost:3001/v1/users
```

---

## 9. Variables de Entorno (servicios/.env)

```env
JWT_SECRET=dev_jwt_secret_key_2024
JWT_EXPIRES_IN=24h
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"
```

---

## 10. Notas para Futuros Agentes

1. **Import de Prisma en CommonJS:** Usar `import pkg from '@prisma/client'; const { PrismaClient } = pkg;` — no usar `import { PrismaClient }` directo.

2. **El entry point es `src/index.ts`** → compila a `dist/index.js`. El `app.listen` va en `index.ts`, la config Express en `app.ts`.

3. **Las rutas NO llevan prefijo `/api`.** El proxy inverso del servidor (Apache/Nginx) agrega `/~USUARIO/api`. Las rutas son `/v1/auth/login`, `/v1/users`, etc.

4. **No usar `require/module.exports`** en los archivos `.ts`. Usar `import/export` de ES modules. TypeScript compila a CommonJS automáticamente.

5. **Siempre usar `next(error)`** en controllers async. El error handler centralizado en `app.ts` mapea errores del service a HTTP.

6. **Crear migraciones con `prisma migrate dev`** antes de cambiar el schema. El servidor aplica las migraciones automáticamente cuando detecta `prisma/migrations/` nuevo.

7. **Nunca subir `node_modules/` ni `.env` al servidor.** Solo `dist/` y `prisma/`.

8. **Para instalar paquetes npm nuevos** en el servidor, conectarse por SSH y correr `npm install` en `~/servicios/`. Luego volver a compilar y subir `dist/`.

9. **El frontend usa `basename` dinámico** en BrowserRouter que detecta `/~USUARIO`. Funciona tanto en local (`/`) como en el servidor (`/~dos/`).

10. **Para build de producción del frontend**, usar `VITE_BASE`:
    ```bash
    VITE_BASE='/~dos/' npm run build
    ```

---

## 11. Estado Actual del Proyecto

### Implementado
- [x] Backend TypeScript con CommonJS (siguiendo guía Schujman)
- [x] SQLite via Prisma con migraciones
- [x] Autenticación JWT con cookies HTTP-only
- [x] Login por username O email
- [x] Registro de usuarios con validación frontend + backend
- [x] CRUD completo de usuarios
- [x] Validaciones expandibles (teléfono argentino, email)
- [x] Theme system Clinical Precision (light/dark)
- [x] shadcn/ui Sidebar con collapsible "icon"
- [x] API_BASE dinámico (detecta servidor vs local)
- [x] React Router basename dinámico
- [x] Vite con base configurable via VITE_BASE

### Pendiente
- [ ] CRUD de doctores
- [ ] CRUD de pacientes
- [ ] Agenda / calendario de turnos
- [ ] Gestión de obras sociales
- [ ] Control de pagos
- [ ] Historias clínicas con tratamientos
- [ ] Sidebar funcional (placeholders → páginas reales)

---

*Última actualización: Mayo 2026 — Migrado a TypeScript + SQLite según Guía Schujman 2026*
