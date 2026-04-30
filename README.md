# Odonto Manager - Sistema de Gestión Odontológica

Sistema completo de gestión para consultorios odontológicos. Frontend en React con backend Node.js/Express y PostgreSQL.

## Integrantes

* Nicolás Paz Reyes
* Martin Moloeznik
* Santiago Cañal

## Stack Tecnológico

- **Frontend:** React 18, Vite 5, Tailwind CSS v3, React Router v6
- **Backend:** Node.js 22, Express, JWT Authentication, Prisma ORM
- **Database:** PostgreSQL 15
- **Infraestructura:** Docker + Docker Compose

---

## 🚀 Guía Rápida - Primera Vez

**IMPORTANTE:** Seguí estos pasos EXACTAMENTE en orden la primera vez.

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repo>
cd Trabajo-React
```

### Paso 2: Primera instalación (Build inicial)

```bash
# Limpia cualquier container viejo (si existen)
docker compose down -v

# Build completo de todas las imágenes
docker compose build --no-cache

# Levanta los servicios
docker compose up -d

# Verifica que todo esté corriendo
docker compose ps
```

### Paso 3: Verificar que funciona

Esperá 30 segundos a que la base de datos inicialice, luego:

```bash
# Ver logs del backend (debería mostrar "Server running on port 3001")
docker logs -f odonto_backend

# En otra terminal, ver logs del frontend
docker logs -f odonto_frontend
```

### Paso 4: Acceder a la aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3003 | Interfaz de usuario React |
| **Backend API** | http://localhost:3002 | API REST Express |
| **PostgreSQL** | localhost:5433 | Base de datos (puerto externo) |

> **Nota:** El frontend usa internamente el puerto 3000, pero se expone en 3003 para evitar conflictos con otros servicios locales.

---

## 🔄 Uso Diario (Después de la primera vez)

### Iniciar los servicios
```bash
docker compose up -d
```

### Ver logs
```bash
# Todos los servicios
docker compose logs -f

# Servicio específico
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Detener servicios
```bash
# Detener (conserva datos)
docker compose down

# Detener y borrar TODO (incluyendo base de datos)
docker compose down -v
```

### Rebuild (si cambias dependencias)
```bash
docker compose up -d --build
```

---

## 🛠️ Troubleshooting

### "Container odonto_db is unhealthy"

```bash
# Reiniciar desde cero (borra datos)
docker compose down -v
docker compose up -d --build
```

### Error de puertos ocupados

```bash
# Ver qué ocupa el puerto
lsof -i :3003
lsof -i :3002
lsof -i :5433

# O liberar todos los puertos
sudo lsof -t -i:3003 | xargs kill -9
sudo lsof -t -i:3002 | xargs kill -9
sudo lsof -t -i:5433 | xargs kill -9
```

### Frontend no carga

```bash
# Verificar logs
docker logs odonto_frontend

# Rebuild si hay cambios en el Dockerfile
docker compose up -d --build frontend
```

### Backend no conecta a la DB

```bash
# Verificar que la DB está healthy
docker ps

# Ver logs del backend
docker logs odonto_backend

# Si falló la migración, reiniciar
docker compose restart backend
```

---

## 📁 Estructura del Proyecto

```
Trabajo-React/
├── docker-compose.yml          # Configuración desarrollo
├── docker-compose.prod.yml     # Configuración producción (Coolify)
├── README.md
├── frontend/                   # React + Vite
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── backend/                    # Node.js + Express
    ├── Dockerfile
    ├── package.json
    ├── server.js
    ├── start.sh               # Script de inicio
    ├── prisma/                # Schema y migraciones
    └── src/
```

---

## 🔌 API Endpoints (v1)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Login con username/password | No |
| POST | `/api/v1/auth/logout` | Cerrar sesión | Sí |
| GET | `/api/v1/auth/me` | Obtener usuario autenticado | Sí |

---

## 🌐 Despliegue en Coolify (Producción)

Ver archivo `docker-compose.prod.yml` para despliegue en Coolify.

### Pasos para Coolify:

1. Sube el código a tu repositorio (GitHub/GitLab)
2. En Coolify, crea un nuevo proyecto tipo "Docker Compose"
3. Seleccioná el repositorio
4. Coolify detectará automáticamente el `docker-compose.prod.yml`
5. Configurá las variables de entorno necesarias en Coolify
6. Deploy

### Variables de entorno para producción (Coolify):

Asegurate de configurar estas variables en Coolify:

- `JWT_SECRET` - Clave secreta para tokens (generar una fuerte)
- `DATABASE_URL` - URL de conexión a PostgreSQL (Coolify la provee automáticamente)
- `FRONTEND_URL` - URL pública del frontend

---

## 📝 Notas de Desarrollo

### Cambios en código
- El código se monta como volumen, los cambios se reflejan automáticamente
- Hot reload funciona en frontend y backend
- Si instalás nuevas dependencias (npm install), rebuild:
  ```bash
  docker compose up -d --build
  ```

### Base de datos
- Los datos se persisten en el volumen `postgres_data`
- Las migraciones se ejecutan automáticamente al iniciar
- El seed se ejecuta en cada inicio (idempotente)

---

## 💡 Comandos Útiles

```bash
# Entrar al contenedor del backend
docker exec -it odonto_backend sh

# Entrar a la base de datos
docker exec -it odonto_db psql -U postgres -d odontodb

# Ver variables de entorno del backend
docker exec odonto_backend env

# Reiniciar un servicio específico
docker compose restart backend
```

---

## ⚠️ Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM mínimo
- Puertos libres: 3002, 3003, 5433
