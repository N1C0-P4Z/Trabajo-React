# AGENTS.md - Contexto del Proyecto

## 1. Qué es este proyecto

Sistema de gestión para una **clínica odontológica**. Actualmente es solo un esqueleto de autenticación (login/logout con JWT + cookies HTTP-only) pero la base técnica está lista para escalar.

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
│   │   ├── schema.prisma       # Modelos de datos
│   │   ├── seed.js             # Usuario admin por defecto
│   │   └── migrations/         # Migraciones aplicadas
│   └── src/
│       ├── app.js              # Configuración Express (sin listen)
│       ├── config/
│       │   └── database.js     # Exporta PrismaClient
│       ├── controllers/
│       │   └── auth.controller.js
│       ├── middlewares/
│       │   └── auth.js         # authenticateToken (cookie-based)
│       ├── repositories/
│       │   └── user.repository.js
│       ├── routes/
│       │   ├── index.js        # Monta /v1
│       │   └── v1/
│       │       ├── index.js    # Agrupa rutas v1
│       │       └── auth.routes.js
│       ├── services/
│       │   └── auth.service.js # Lógica de negocio auth
│       └── utils/
│           ├── bcrypt.js       # Wrapper de bcrypt
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
        ├── App.jsx
        ├── main.jsx
        ├── index.css           # Variables CSS de tema (HSL) + Tailwind directives
        ├── components/
        │   ├── ui/             # Componentes de shadcn/ui
        │   │   ├── button.jsx
        │   │   └── card.jsx
        │   ├── Header.jsx
        │   ├── LoginForm.jsx   # Usa Button de shadcn/ui
        │   └── ProtectedRoute.jsx
        ├── contexts/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useAuth.js
        ├── lib/
        │   └── utils.js        # Helper cn() para shadcn/ui
        ├── pages/
        │   ├── LoginPage.jsx   # Usa Card de shadcn/ui
        │   └── DashboardPage.jsx
        └── services/
            └── authService.js   # Cliente HTTP: /api/v1/auth/...
```

---

## 4. Patrón para Agregar una Nueva Entidad

Cuando se necesite agregar un recurso nuevo (ej: `Patient`, `Appointment`, `Treatment`), seguir **ESTRICTAMENTE** este flujo de abajo hacia arriba:

### Paso 1: Modelo Prisma
```
backend/prisma/schema.prisma → agregar model
```
Luego ejecutar:
```bash
docker compose exec -T backend npx prisma migrate dev --name nombre_entidad
docker compose exec backend npx prisma generate
```

### Paso 2: Repository
```
backend/src/repositories/<entidad>.repository.js
```
- Solo funciones CRUD que usan `prisma.<model>.findUnique`, `.create`, etc.
- **NO lógica de negocio aquí**

### Paso 3: Service
```
backend/src/services/<entidad>.service.js
```
- Importa el repository
- Aplica validaciones, reglas de negocio, transformaciones
- Lanza errores con mensajes descriptivos
- **NO maneja req/res**

### Paso 4: Controller
```
backend/src/controllers/<entidad>.controller.js
```
- Extrae datos de `req.body`, `req.params`, `req.query`
- Llama al service
- Maneja respuesta HTTP (`res.json`, `res.status`)
- Delega errores con `next(error)`

### Paso 5: Routes
```
backend/src/routes/v1/<entidad>.routes.js
```
- Define método HTTP + URL + controller
- Importar y registrar en:
```
backend/src/routes/v1/index.js → router.use('/<entidad>', <entidad>Routes)
```

### Paso 6: Frontend Service (si aplica)
```
frontend/src/services/<entidad>Service.js
```
- Funciones `fetch` a `/api/v1/<entidad>/...`
- Siempre con `credentials: 'include'` para cookies

---

## 5. Comandos Docker Clave

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
# Luego recrear el admin:
docker compose exec backend node /app/prisma/seed.js
```

### Comandos Prisma dentro del contenedor
```bash
docker compose exec -T backend npx prisma migrate deploy    # Aplicar migraciones
docker compose exec -T backend npx prisma migrate dev --name X   # Crear migración
docker compose exec backend npx prisma generate             # Generar cliente
docker compose exec backend npx prisma studio               # GUI de Prisma
```

---

## 6. Variables de Entorno (backend/.env)

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

**Nota:** En `docker-compose.yml`, `FRONTEND_URL` es `http://localhost:3000` porque el contenedor frontend escucha en 3000 **internamente**, aunque el host acceda por 3003.

---

## 7. Decisiones Arquitectónicas Importantes

### Autenticación: Cookies HTTP-only (NO LocalStorage)
- El token JWT se almacena en una cookie `httpOnly; SameSite=strict; Secure` (solo en producción)
- El frontend nunca toca el token directamente
- Todos los fetch deben incluir `credentials: 'include'`
- El backend lee `req.cookies.token` (no `Authorization: Bearer` header)

### Versionado de API: `/api/v1/...`
- Todos los endpoints nuevos deben ir bajo `/api/v1/`
- Permite futuras versiones (`v2`) sin romper clientes
- El frontend apunta a `/api/v1` via proxy de Vite

### Separación app.js / server.js
- `app.js` → Configura Express, exporta `app`. **No abre puerto.**
- `server.js` → Importa `app`, hace `app.listen(PORT)`.
- Esto permite testear `app` sin levantar un servidor real.

### Auto-migrate y Auto-seed
- El script `backend/start.sh` corre automáticamente al iniciar el contenedor:
  1. `npx prisma migrate deploy`
  2. `node prisma/seed.js`
  3. `node server.js`
- **Nunca hay que correr migraciones manualmente** al levantar con Docker.

### shadcn/ui en el Frontend
- shadcn/ui v4 está instalado con preset **Mira** y librería **Radix**
- **Tailwind CSS v3** (NO v4) — las variables CSS usan formato HSL, no oklch
- Componentes instalados: `button`, `card`
- Para agregar más componentes:
  ```bash
  docker compose exec frontend npx shadcn add <nombre-componente>
  ```
  **Nunca** instalar paquetes npm o shadcn directamente en la máquina host dentro de `frontend/`.

### Tema Dark/Light
- shadcn/ui soporta dark mode vía clase `.dark`
- Para activar dark mode en una página específica, agregar `className="dark"` al contenedor
- Las variables CSS en `index.css` definen ambos temas (`:root` = light, `.dark` = dark)

---

## 8. Estado Actual del Proyecto

### ✅ Implementado
- [x] Stack Docker completo (Postgres + Backend + Frontend)
- [x] Autenticación JWT con cookies HTTP-only
- [x] Arquitectura de capas (Repository → Service → Controller → Route)
- [x] Versionado de API (`/api/v1/`)
- [x] Prisma ORM con PostgreSQL
- [x] Auto-migrate y auto-seed en startup
- [x] CORS configurado para cookies cross-origin
- [x] shadcn/ui instalado (button, card)
- [x] Login usando componentes shadcn/ui (Card + Button)
- [x] Tailwind CSS configurado con variables de tema para shadcn

### ❌ Pendiente (próximos pasos esperados)
- [ ] **CRÍTICO: Definir modelo de datos multi-clínica** — ver Nota 10
- [ ] Instalar componentes adicionales de shadcn/ui (input, label, form, etc.)
- [ ] Aplicar tema oscuro al login (clase `dark`)
- [ ] Registro de usuarios (register endpoint + frontend)
- [ ] CRUD de pacientes
- [ ] Agenda / calendario de turnos
- [ ] Gestión de obras sociales
- [ ] Control de pagos
- [ ] Historias clínicas con tratamientos
- [ ] Pantallas del frontend para cada funcionalidad

---

## 9. Notas para Futuros Agentes

1. **Nunca modificar `server.js` salvo para cambiar el puerto.** Toda la configuración de Express debe ir en `src/app.js`.

2. **Nunca importar Prisma directamente desde controllers o routes.** Siempre usar `src/config/database.js` o el repository correspondiente.

3. **Siempre usar `next(error)` en controllers async.** El error handler centralizado en `app.js` traduce errores del service a códigos HTTP.

4. **Toda ruta nueva va bajo `/api/v1/`**. Agregar en `src/routes/v1/index.js`.

5. **El proyecto usa CommonJS** (`require`/`module.exports`) en el backend, ESM (`import`/`export`) en el frontend.

6. **Si Docker falla al levantar:** verificar que los puertos 3000, 3001, 3002, 3003, 5432, 5433 no estén ocupados por procesos locales.

7. **Para testear endpoints:** usar `curl` con `-c cookies.txt` (guardar cookie) y `-b cookies.txt` (enviar cookie).

8. **Si cambias el schema.prisma:** siempre correr `prisma generate` dentro del contenedor, o reconstruir la imagen con `docker compose up -d --build`.

9. **SIEMPRE usar `docker compose exec frontend npm install` (o npx).** Nunca correr `npm install` localmente en `frontend/` porque crea un `node_modules` incompatible con Alpine Linux que Docker monta sobre el contenedor, causando errores como `ENOENT: tw-animate-css` o `border-border does not exist`.

10. **Si el CSS de shadcn/ui falla con `border-border does not exist`:** verificar que `tailwind.config.js` tenga las variables extendidas (colors, borderRadius) y que `index.css` use formato HSL (no oklch).

---

## 10. Nota Especial: Diseño del Modelo de Datos Multi-Clínica

**Esta decisión está pendiente y debe resolverse antes de continuar.**

El equipo discutió un modelo donde:
- Cada "deploy" del software puede servir a una o múltiples clínicas
- Existe un **Super Admin** (los desarrolladores) que ven todas las clínicas
- Cada clínica tiene un **Owner/Admin** que gestiona usuarios (dentistas, secretarias, pacientes)
- Los usuarios se registran públicamente y se vinculan a una clínica
- Los roles son: `SUPER_ADMIN`, `OWNER`, `DENTIST`, `SECRETARY`, `PATIENT`

**Pregunta sin resolver:** ¿Es un SaaS multi-tenant (una instancia, muchas clínicas) o single-tenant por deploy (cada clínica tiene su propia instancia)? Esto define si el schema de Prisma necesita un modelo `Clinic` con `clinic_id` en todas las tablas.

---

*Última actualización: Abril 2026*
*Próximo paso esperado: Instalar componentes shadcn/ui (input, label), aplicar tema oscuro al login, y definir el endpoint de registro de usuarios.*
