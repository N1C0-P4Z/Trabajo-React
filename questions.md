# Preguntas para arrancar el proyecto Odontología + PostgreSQL/Prisma

## Contexto
Migración del backend actual (Express + SQLite + JWT en cookies HTTP-only) a PostgreSQL + Prisma. El frontend será desarrollado con **Lovable** (one-shot, versión gratuita). Se mantiene el login propio (sin OAuth).

---

## 1. Infraestructura de PostgreSQL
- ¿Van a correr PostgreSQL localmente (instalado en la máquina), con Docker, o usar un servicio en la nube (Supabase, Neon, Railway)?

VAmos a correr PostgreSQL con docker
- ¿Ya tienen una instancia de PostgreSQL corriendo o necesitamos configurarla desde cero?
necesitamos configurarla desde cero, ns bien que significa esto pero si desde cero.
- ¿Necesitan un `docker-compose.yml` para levantar PostgreSQL junto con el backend?
Si necesitamos un docker-compose.yml para levantar PostgreSQL junto con el backend.
---

## 2. Modelo de datos (Prisma Schema)
- Además de la tabla `users`, ¿qué otras entidades queremos modelar ya en esta etapa inicial?  
  _Ejemplos: `dentists`, `patients`, `appointments`, `insurance_providers`, `payments`, `clinical_records`…_
  por ahora va a haber un usuers y un admin, para la primera entrega que es solo un login. Pero va a haber dentistas, pacientes...
- ¿El usuario del login es directamente el odontólogo, o hay una separación entre `users` (cuenta) y `dentists` (perfil profesional)?
en un futuro va a haber una separacion
- ¿Necesitamos roles desde el inicio (`ADMIN`, `DENTIST`, `SECRETARY`) o un solo tipo de usuario por ahora?
por ahora solo users y admin
---

## 3. Autenticación y autorización
- ¿Mantienen la estrategia actual de **JWT en cookies HTTP-only** o prefieren cambiar a **tokens en localStorage** (Authorization Bearer)?
Quiero que la logica del login siga siendo la que existe, que esta bien. Lo unico que vamos a cambiar es que ahora la db es en Postgres + Prisma
- ¿Quieren agregar un endpoint de **registro** (`/register`) además del login, o seguirán creando usuarios manualmente/seed?
Si agrega el endopoint de registro
---

## 4. Estructura del backend
- ¿Prefieren reorganizar el backend para soportar Prisma (carpeta `prisma/`, `src/`, etc.) o adaptar la estructura actual (`server.js`, `routes/`, `db/`)?
QUiero reorganizar el backend para soportar prisma con Postgres
- ¿Quieren usar **ES Modules** (`"type": "module"`) en el backend como en el frontend, o mantienen CommonJS (`require`)?
no se que es
- ¿Les interesa agregar un validador de schemas (como **Zod** o **Joi**) para las requests?
no se que es

---

## 5. Migraciones y seed
- ¿Quieren usar **Prisma Migrate** para manejar cambios en la base de datos?
si vamos a usar prisma migrate para manejar cambios en la base de datos
- ¿Necesitan seed inicial (usuario admin, datos de prueba) al levantar la app?
no
- ¿Mantienen la contraseña por defecto `admin / secret123` o cambiamos eso?
si
---

## 6. Frontend (Lovable)
- ¿El diseño/estructura del frontend se mantiene exactamente igual (solo cambia la URL del backend) o quieren aprovechar para reestructurar algo?
el frontend lo vamos a restructurar todo.
- ¿Necesitan manejar estados de carga (`loading`) y errores de forma más robusta en el login?
yes
- ¿Quieren agregar una página de **registro** en el frontend o solo login por ahora?
si agregalo
---

## 7. Seguridad y configuración
- ¿Van a usar variables de entorno (`.env`) para las credenciales de PostgreSQL? ¿Necesitan un `.env.example` de referencia?
si se necesita un .env.example de referencia
- ¿Necesitan rate limiting en el login para evitar ataques de fuerza bruta?
por ahora no, pero deja documentado esto para un futuro
- ¿Quieren hash de contraseñas con bcrypt (como ahora) o consideran argon2?
Por ahora me quedo con bcrypt, pero deja documentado para un futuro usar argon2

---

## 8. Testing y calidad
- ¿Quieren agregar tests desde el inicio (Jest, Vitest) o eso se deja para después?
lo dejamos para despues
- ¿Necesitan un script de `prisma studio` o `prisma generate` en el `package.json`?
yets

---

## 9. Documentación interna
- ¿Quieren que les prepare un `README.md` con los pasos para levantar el proyecto (instalar PostgreSQL, correr migraciones, seed, etc.)?
si agrega en el readme.md que existe eso, pero no borres lo que ya esta escrito
- ¿Necesitan un diagrama del schema de Prisma o con el archivo `schema.prisma` es suficiente?
crea las 2 cosas
---

## 10. Stack Tecnológico

### Backend
- **¿Lenguaje:** ¿Seguimos con JavaScript puro o migramos a TypeScript?
seguimos con javascript
- **¿Módulos:** ¿CommonJS (`require`) o ES Modules (`import`)?
CommonJS como se esta usando ahora
- **¿Validación de requests:** ¿Zod, Joi, o ninguno por ahora?
ninguno por ahora
- **¿HTTP client interno:** ¿Usamos `fetch` nativo, `axios`, o `node-fetch`?
fetch nativo por ahora
### Frontend (Lovable)
- **¿Lenguaje:** ¿JavaScript puro (`.jsx`) o TypeScript (`.tsx`)?
JavaScript puro (`.jsx`)
- **¿Estilos:** ¿Tailwind CSS puro o componentes con shadcn/ui?
componentes con shadcn/ui. IGual quiero que la pagina pueda verse en celular tambien, eso se puede solucionar con flexbox.
- **¿Manejo de estados y fetching:** ¿`fetch` nativo + React Context, o librería tipo React Query / SWR?
lo que se este usando ahora
- **¿Routing:** ¿React Router DOM (v6) como ahora, o alguna alternativa?
React Router DOM (v6) como ahora
- **¿Formularios:** ¿Manejo manual con `useState` o librería como React Hook Form?
manejo manual
- **¿Notificaciones/Toasts:** ¿Librería tipo `sonner` / `react-hot-toast`, o nada por ahora?
nada por ahora

### DevOps / Herramientas
- **¿Docker:** ¿Solo PostgreSQL o también el backend en un contenedor?
solo PostgreSQL
- **¿Variables de entorno:** ¿Usamos `dotenv` (como ahora) o native `NODE_ENV` + `.env`?
como ahora
- **¿Formateo/Linting:** ¿Prettier + ESLint, o nada por ahora?
nada por ahora
- **¿Monorepo:** ¿Separado (`frontend/`, `backend/`) o unifican todo en un solo `package.json`?
que sea un monorepo, separado en 2 carpetas el front y el back.

---

> **Nota:** Una vez respondidas estas preguntas, armaremos un segundo documento para diseñar el **mega prompt de Lovable** (frontend one-shot).
