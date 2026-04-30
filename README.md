# Trabajo-React

## Integrantes

* Nicolás Paz Reyes
* Martin Moloeznik
* Santiago Cañal


## Stack

- **Frontend:** React 18, Vite, Tailwind CSS v3, React Router
- **Backend:** Node.js 22, Express, JWT
- **Database:** PostgreSQL 15, Prisma ORM
- **Infra:** Docker + Docker Compose

## Servicios locales (despues de `docker compose up`)

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3003 |
| Backend API | http://localhost:3002 |
| PostgreSQL | localhost:5433 |

> Nota: El frontend usa internamente el puerto 3000 (guia del curso), pero se expone en 3003 para evitar conflictos locales.

## Endpoints de la API (v1)

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/v1/auth/login` | Login con username/password |
| POST | `/api/v1/auth/logout` | Cerrar sesion |
| GET | `/api/v1/auth/me` | Obtener usuario autenticado |

## Para levantar de Forma Local:

Desde la raiz del repositorio: docker compose up -d --build