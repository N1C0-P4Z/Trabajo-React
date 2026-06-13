# Exploration: Patient Self-Service View

## Current State

### Authentication & User Model
- JWT cookies via `authenticateToken` middleware. `req.user` = `{ userId, username, role }`.
- Frontend `useAuth()` provides `user` with full public profile: `{ id, username, email, first_name, last_name, phone, role, specialty, license_number, is_active, avatar_url, created_at }`.
- Roles: `SUPER_ADMIN`, `OWNER`, `DENTIST`, `SECRETARY`, `PATIENT`.

### Appointment Backend (`GET /v1/appointments`)
- **NO patient_id or doctor_id filter**. Only `start`/`end` date range query params.
- `appointmentRepository.findByDateRange(start, end)` uses `WHERE datetime >= start AND datetime <= end`.
- Prisma `Appointment` model has `patient_id INT` and `doctor_id INT` — filtering by these is a simple WHERE clause addition. Zero schema changes needed.
- No `/me` endpoint exists for appointments.

### Appointment Frontend (`AgendaPage.jsx`)
- Loads **all** appointments in date range via `appointmentService.getAll(start, end)`.
- Client-side doctor filter via `<Select>` dropdown. No patient filter.
- Shows "Nuevo turno" button (unrestricted for any authenticated user).
- Loads patient list (`GET /v1/users?role=PATIENT`) and doctor list (`GET /v1/users?role=DENTIST`) for the `AppointmentForm` dropdowns.
- Has CalendarGrid/WeekView/DayView + ResumenPanel sidebar.

### Sidebar (`AppSidebar.jsx`)
- 6 hardcoded items: Dashboard, Doctores, Pacientes, Agenda, Obras Sociales, Pagos.
- Only "Admin" is conditionally shown (for `SUPER_ADMIN/OWNER/SECRETARY`).
- **PATIENT sees all 6 items** but 4 redirect back to `/dashboard` via `RoleProtectedRoute` — confusing UX.

### Dashboard (`DashboardPage.jsx`)
- **Shows ALL users table** to every authenticated role — **privacy bug**.
- Fetches `userService.getAll()` unconditionally, no role check.
- Has delete buttons and role labels visible to all.

### Route Guards
| Route | Protection |
|---|---|
| `/dashboard` | `ProtectedRoute` (any authenticated) |
| `/doctors` | `RoleProtectedRoute` — SUPER_ADMIN, OWNER, SECRETARY |
| `/doctors/:id` | `RoleProtectedRoute` — SUPER_ADMIN, OWNER, SECRETARY |
| `/patients` | `RoleProtectedRoute` — SUPER_ADMIN, OWNER, SECRETARY |
| `/appointments` | `ProtectedRoute` (any authenticated) |
| `/admin` | `RoleProtectedRoute` — SUPER_ADMIN, OWNER, SECRETARY |
| `/insurance` | `ProtectedRoute` (placeholder) |
| `/payments` | `ProtectedRoute` (placeholder) |

### Patient Data
- `Patient` is a separate Prisma table linked to `User` via `user_id` (1:1).
- Patient profile is auto-created when a PATIENT-role user registers.
- Backend: `GET /v1/patients` (list with filters), `GET /v1/patients/:id`, `PUT /v1/patients/:id`.
- Fields: `dni`, `obra_social`, `numero_afiliado`, `fecha_nacimiento`, `direccion`, `contacto_emergencia`, `alergias`, `notas`.

## Affected Areas

| File | How affected |
|---|---|
| `servicios/src/controllers/appointment.controller.ts` | Add `patient_id` query param + `/me` endpoint |
| `servicios/src/services/appointment.service.ts` | Add patient/doctor ID filtering logic |
| `servicios/src/repositories/appointment.repository.ts` | Add `findByDateRangeAndPatient` or extend WHERE clause |
| `frontend/src/components/AppSidebar.jsx` | Role-based menu: PATIENT sees Agenda + Mi Perfil; DENTIST sees Agenda + Mis Pacientes |
| `frontend/src/pages/DashboardPage.jsx` | Role-specific content: PATIENT → upcoming appointments; DENTIST → today's appointments; staff → user list |
| `frontend/src/pages/AgendaPage.jsx` | Auto-filter by patient/doctor ID from auth context; hide "Nuevo turno" for PATIENT |
| `frontend/src/services/appointmentService.js` | Add `patient_id` param to `getAll()` |
| `frontend/src/App.jsx` | Optionally redirect PATIENT `/dashboard` → `/appointments` |

## Approaches

### 1. Frontend-only role filtering
Filter appointments client-side by `user.id`, hide sidebar items by role, show role-specific dashboard content. **No backend changes.**

| Pros | Cons |
|---|---|
| Fastest to implement | All appointments still load in network response (privacy leak) |
| No deploy coordination | Inefficient for large datasets |
| Low risk | Doesn't scale |

**Effort: Low**

### 2. Backend query-param filtering
Add `patient_id` and `doctor_id` optional query params to `GET /v1/appointments`. Backend enforces the filter server-side. Frontend passes correct IDs.

| Pros | Cons |
|---|---|
| Secure (backend-enforced) | Requires backend build + deploy |
| Efficient (only relevant data) | Coordination between frontend/backend |
| Scales to large datasets | |

**Effort: Medium**

### 3. Backend `/me` endpoint
Add `GET /v1/appointments/me` that auto-filters by `req.user.userId`. For PATIENT role → filter by `patient_id`. For DENTIST role → filter by `doctor_id`.

| Pros | Cons |
|---|---|
| Clean API design | More routes to maintain |
| Zero ambiguity | More backend code |
| Role enforced at backend | |

**Effort: Medium**

## Recommendation

**Approach 2 + 3 combined** — Add `patient_id`/`doctor_id` query params to `GET /v1/appointments` AND add `GET /v1/appointments/me` convenience endpoint. This is a **small backend change** (3 files, additive, no breaking changes) and the **frontend changes are contained** to ~5 files.

### Backend changes (additive, no migrations)
1. `appointment.repository.ts` — extend `findByDateRange` to accept optional `patientId`/`doctorId` filters
2. `appointment.service.ts` — pass filters through
3. `appointment.controller.ts` — read `patient_id`/`doctor_id` from query params; add `/me` route handler
4. `appointment.routes.ts` — add `GET /me` route

### Frontend changes
1. `AppSidebar.jsx` — role-specific `visibleMenuItems`: PATIENT → Agenda + Mi Perfil; DENTIST → Agenda + (maybe) Pacientes; staff → all
2. `DashboardPage.jsx` — role-specific content: PATIENT → upcoming appointments + info card; DENTIST → today's schedule; staff → user list (current)
3. `AgendaPage.jsx` — for PATIENT: auto-filter appointments by `user.id` via `appointmentService.getAll(start, end, user.id)`; hide "Nuevo turno" button; maybe hide doctor filter
4. `appointmentService.js` — add `patientId` param to `getAll()`
5. `App.jsx` — optionally redirect PATIENT from `/dashboard` to `/appointments`

## File Map

```
servicios/src/
├── controllers/appointment.controller.ts  ← Add patient_id param + /me handler
├── services/appointment.service.ts        ← Add patient/doctor filtering
├── repositories/appointment.repository.ts ← Extend WHERE clause
└── routes/v1/appointment.routes.ts        ← Add GET /me route

frontend/src/
├── components/AppSidebar.jsx              ← Role-based menu items
├── pages/DashboardPage.jsx                ← Role-specific dashboard content
├── pages/AgendaPage.jsx                   ← PATIENT auto-filter + hide controls
├── services/appointmentService.js         ← Add patientId param
└── App.jsx                                ← PATIENT dashboard redirect (optional)
```

## Risks

- **Backend deploy sequencing**: New query params must be deployed before frontend starts using them. Mitigation: params are optional/backward-compatible.
- **PATIENT creating appointments**: The "Nuevo turno" button in AgendaPage is visible to all. Should PATIENT be allowed to self-book? Mitigation: hide for PATIENT in MVP.
- **DENTIST seeing other doctors' patients**: AgendaPage loads all PATIENT-role users for the form dropdown. Mitigation: This is a separate concern — the current change only needs to fix the Dashboard user list leak and Agenda appointment filtering.
- **No migration needed**: `Appointment.patient_id` and `Appointment.doctor_id` already exist in the Prisma schema — filtering is a pure WHERE clause change.

## Ready for Proposal

**Yes** — sufficient detail to proceed with `sdd-propose` or `sdd-spec` for `patient-self-service`.
