# AGENTS.md - Contexto del Proyecto

## 1. Qué es este proyecto

Sistema de gestión para una **clínica odontológica** con autenticación JWT, registro de usuarios, y sidebar con navegación. La base técnica está lista para escalar a módulos de pacientes, doctores, citas, obras sociales y pagos.

**Integrantes:** Nicolás Paz Reyes, Martin Moloeznik, Santiago Cañal.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend** | React | 18 |
| | Vite | 5 |
| | Tailwind CSS | v3 |
| | React Router DOM | 6 |
| | shadcn/ui | 4.6 (Radix + preset Mira) |
| **Backend** | Node.js | 22 (Alpine en Docker) |
| | Express | 4 |
| | JWT (jsonwebtoken) | 9 |
| | bcrypt | 5 |
| | Prisma ORM | 5 |
| **Database** | PostgreSQL | 15 (Alpine) |
| **Infra** | Docker + Docker Compose | v3.8 |

---

## 3. Estructura de Directorios

### Raíz del proyecto
```
Trabajo-React/
├── docker-compose.yml          # Stack completo: db + backend + frontend
├── README.md                   # Instrucciones básicas y puertos
├── AGENTS.md                   # Este archivo
├── backend/
│   ├── Dockerfile              # Node 22 Alpine + openssl para Prisma
│   ├── .dockerignore
│   ├── .env                    # Configuración local (no commitear)
│   ├── .env.example            # Template de variables
│   ├── package.json
│   ├── server.js               # SOLO arranca el servidor (app.listen)
│   ├── start.sh                # Orquesta: migrate → seed → server
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos de datos (User con Role enum)
│   │   ├── seed.js             # Usuario admin por defecto
│   │   └── migrations/         # Migraciones aplicadas
│   └── src/
│       ├── app.js              # Configuración Express (sin listen) + errores
│       ├── config/
│       │   └── database.js    # Exporta PrismaClient
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── user.controller.js
│       ├── middlewares/
│       │   └── auth.js         # authenticateToken (cookie-based)
│       ├── repositories/
│       │   └── user.repository.js
│       ├── routes/
│       │   ├── index.js        # Monta /api/v1
│       │   └── v1/
│       │       ├── index.js    # Agrupa rutas v1
│       │       ├── auth.routes.js
│       │       └── user.routes.js
│       ├── services/
│       │   ├── auth.service.js  # Login (username o email) + getUserFromToken
│       │   └── user.service.js # Registro + CRUD + validaciones expandibles
│       └── utils/
│           ├── bcrypt.js        # Wrapper de bcrypt
│           └── jwt.js          # generateToken / verifyToken
└── frontend/
    ├── Dockerfile              # Node 22 Alpine
    ├── .dockerignore
    ├── jsconfig.json           # Alias @/ para imports
    ├── package.json
    ├── vite.config.js          # Puerto 3000, host 0.0.0.0, proxy /api, alias @/
    ├── tailwind.config.js      # Extendido con colores de shadcn/ui
    ├── postcss.config.js
    ├── components.json         # Configuración de shadcn/ui
    └── src/
        ├── App.jsx              # Routes con Sidebar shadcn
        ├── main.jsx             # Providers: Theme, Auth, Tooltip
        ├── index.css            # Variables CSS tema Clinical Precision
        ├── contexts/
        │   ├── AuthContext.jsx
        │   └── ThemeContext.jsx
        ├── hooks/
        │   └── useAuth.js
        ├── lib/
        │   └── utils.js         # Helper cn() para shadcn/ui
        ├── services/
        │   ├── authService.js   # Cliente HTTP: /api/v1/auth/...
        │   └── userService.js    # Cliente HTTP: /api/v1/users
        ├── components/
        │   ├── ui/              # Componentes de shadcn/ui
        │   │   ├── button.jsx
        │   │   ├── card.jsx
        │   │   ├── input.jsx
        │   │   ├── label.jsx
        │   │   ├── avatar.jsx
        │   │   ├── separator.jsx
        │   │   ├── sheet.jsx
        │   │   ├── sidebar.jsx   # Componente nativo shadcn
        │   │   └── tooltip.jsx
        │   ├── AppSidebar.jsx   # Sidebar con menú + cerrar sesión
        │   ├── ThemeToggle.jsx  # Botón luz/luna
        │   ├── LoginForm.jsx
        │   ├── RegisterForm.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            └── DashboardPage.jsx
```

---

## 4. Modelo de Datos (Prisma)

### User Model
```prisma
enum Role {
  SUPER_ADMIN
  OWNER
  DENTIST
  SECRETARY
  PATIENT
}

model User {
  id            Int      @id @default(autoincrement())
  username      String   @unique
  email         String   @unique
  first_name    String
  last_name     String
  phone         String   // Required, formato argentino
  password_hash String
  role          Role     @default(PATIENT)
  created_at    DateTime @default(now())
}
```

---

## 5. API Endpoints

### Auth (/api/v1/auth)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | /login | Login con username o email + password |
| POST | /logout | Cerrar sesión (limpia cookie) |
| GET | /me | Obtener usuario actual desde cookie JWT |

### Users (/api/v1/users)
| Método | Endpoint | Descripción |
|---|---|---|
| POST | / | Registrar nuevo usuario |
| GET | / | Listar todos los usuarios (solo admin) |
| GET | /:id | Obtener usuario por ID |
| PUT | /:id | Actualizar usuario |
| DELETE | /:id | Eliminar usuario |

---

## 6. Validaciones Expandibles (Backend)

### Teléfono (Argentina)
```js
// backend/src/services/user.service.js
const countryPhoneValidators = {
  AR: {
    regex: /^\+?54\s?(?:9\s?)?\d{2,4}\s?\d{4}[\s-]?\d{4}$/,
    message: 'Formato argentino inválido. Ej: +54 9 11 1234-5678'
  }
  // Para agregar Uruguay u otros países:
  // UY: { regex: /^\+?598.../, message: '...' }
};
```

### Email
- Validación general RFC-like: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Expandible para validar dominios específicos en el futuro

### Errores HTTP
- `400` — Validaciones fallidas (campos requeridos, formato)
- `401` — Credenciales inválidas
- `409` — Conflicto (username/email/teléfono ya existe)
- `404` — Usuario no encontrado

---

## 7. Comandos Docker Clave

### Levantar todo el stack
```bash
cd /home/nicolas/Documentos/Trabajo-React
docker compose up -d --build
```

### Ver logs
```bash
docker compose logs -f backend   # o -f frontend, -f db
```

### Reset completo (borra datos de PostgreSQL)
```bash
docker compose down -v
docker compose up -d --build
```

### Comandos Prisma dentro del contenedor
```bash
docker compose exec -T backend npx prisma migrate deploy    # Aplicar migraciones
docker compose exec -T backend npx prisma db push           # Push schema directamente
docker compose exec backend npx prisma generate            # Generar cliente
docker compose exec backend node /app/prisma/seed.js      # Re-seed manual
```

---

## 8. Variables de Entorno (backend/.env)

```
# JWT
JWT_SECRET=dev_jwt_secret_key_2024
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development

# CORS (frontend expuesto en puerto 3003 del host)
FRONTEND_URL=http://localhost:3000

# Database (dentro de Docker la red usa hostname 'db')
DATABASE_URL=postgresql://postgres:postgres@db:5432/odontodb?schema=public
```

---

## 9. Decisiones Arquitectónicas Importantes

### Autenticación: Cookies HTTP-only (NO LocalStorage)
- El token JWT se almacena en una cookie `httpOnly; SameSite=strict; Secure`
- El frontend nunca toca el token directamente
- Todos los fetch deben incluir `credentials: 'include'`
- El backend lee `req.cookies.token`

### Versionado de API: `/api/v1/...`
- Todos los endpoints nuevos deben ir bajo `/api/v1/`

### Theme System (Clinical Precision)
- Light mode: fondo blanco (`#FFFFFF`), primary azul (`#2563EB`), texto casi negro (`#0F172A`)
- Dark mode: fondo navy (`#181825`), primary azul (`#2563EB`), texto blanco (`#F8FAFC`)
- Toggle guardado en `localStorage` con `ThemeProvider`

### shadcn/ui Sidebar
- Componente nativo `Sidebar` de shadcn con `collapsible="icon"`
- Ancho: 280px expandido, 64px contraído
- SidebarProvider + AppSidebar + SidebarInset
- TooltipProvider envuelve toda la app

### Registro de Usuarios
- Frontend: RegisterForm con validación en tiempo real (onBlur)
- Valida: nombre, apellido, username, email, teléfono argentino, contraseña >= 6 chars
- Valida contraseñas coincidentes
- Muestra errores en rojo (bg-destructive/10)

---

## 10. Rutas del Frontend

| Path | Componente | Requiere Auth? |
|---|---|---|
| `/` | LandingPage | ❌ No |
| `/login` | LoginPage | ❌ No |
| `/register` | RegisterPage | ❌ No |
| `/dashboard` | DashboardPage | ✅ Sí |
| `/doctors` | Placeholder | ✅ Sí |
| `/patients` | Placeholder | ✅ Sí |
| `/appointments` | Placeholder | ✅ Sí |
| `/insurance` | Placeholder | ✅ Sí |
| `/payments` | Placeholder | ✅ Sí |

---

## 11. Estado Actual del Proyecto

### ✅ Implementado
- [x] Stack Docker completo (Postgres + Backend + Frontend)
- [x] Autenticación JWT con cookies HTTP-only
- [x] Login por username O email
- [x] Registro de usuarios con validación frontend + backend
- [x] CRUD completo de usuarios (User repository + service + controller)
- [x] Validaciones expandibles (teléfono argentino, email)
- [x] Modelo User con Role enum (SUPER_ADMIN, OWNER, DENTIST, SECRETARY, PATIENT)
- [x] Theme system Clinical Precision (light/dark)
- [x] shadcn/ui Sidebar nativo con collapsible "icon"
- [x] Rutas: Landing, Login, Register, Dashboard + placeholders
- [x] Componentes shadcn: button, card, input, label, avatar, separator, sheet, sidebar, tooltip

### ❌ Pendiente
- [ ] CRUD de doctores
- [ ] CRUD de pacientes
- [ ] Agenda / calendario de turnos
- [ ] Gestión de obras sociales
- [ ] Control de pagos
- [ ] Historias clínicas con tratamientos
- [ ] Sidebar funcional (placeholders → páginas reales)
- [ ] Definir modelo multi-clínica

---

## 12. Notas para Futuros Agentes

1. **Nunca modificar `server.js` salvo para cambiar el puerto.** Toda la configuración de Express debe ir en `src/app.js`.

2. **Nunca importar Prisma directamente desde controllers o routes.** Siempre usar `src/config/database.js` o el repository correspondiente.

3. **Siempre usar `next(error)` en controllers async.** El error handler centralizado en `app.js` traduce errores del service a códigos HTTP.

4. **Toda ruta nueva va bajo `/api/v1/`** y también bajo `/` en el frontend (App.jsx con Sidebar).

5. **El proyecto usa CommonJS** (`require`/`module.exports`) en el backend, ESM (`import`/`export`) en el frontend.

6. **Para agregar componentes shadcn:**
   ```bash
   docker compose exec frontend npx shadcn add <componente>
   ```
   **Nunca** instalar paquetes npm o shadcn directamente en la máquina host.

7. **Para testear endpoints con cookies:**
   ```bash
   curl -c cookies.txt -X POST http://localhost:3002/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"secret123"}'
   curl -b cookies.txt http://localhost:3002/api/v1/users
   ```

8. **Si el CSS falla con errores de Tailwind:** verificar que las variables CSS en `index.css` usen formato HSL (no OKLCH).

9. **El sidebar usa `collapsible="icon"`** — cuando se achica solo muestra íconos, no desaparece.

10. **RegisterForm tiene validación en tiempo real** con `onBlur` — los errores aparecen en rojo (`bg-destructive/10`) debajo de cada campo.

---

## 13. Puertos

| Servicio | Puerto Interno | Puerto Host |
|---|---|---|
| Frontend (Vite) | 3000 | 3003 |
| Backend (Express) | 3001 | 3002 |
| PostgreSQL | 5432 | 5433 |

---

*Última actualización: Mayo 2026*
*Estado: Registro + Login + Sidebar funcionando, placeholders para módulos de la clínica*