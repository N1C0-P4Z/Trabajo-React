# Design: Patient Self-Service View

## Technical Approach

Scope dashboard and agenda to role-relevant data. Replace the current sidebar ternary with a role-lookup object. Add backend filtering by `patient_id` and `doctor_id` (via query params and a `/me` convenience endpoint). Frontend auto-filters by role and redirects PATIENTs away from the dashboard. No schema changes needed.

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|----------|--------|----------|--------|
| Sidebar filtering | Role-lookup object | Extensible; avoids nested ternaries | **Role-lookup object** — `ROLE_MENU_ITEMS[role]` maps role → visible paths |
| Backend self-filter | `/me` endpoint + query params | `/me` is convenient for frontend; query params keep API generic for staff | **Both** — `/me` for frontend simplicity; `?patient_id=` / `?doctor_id=` for staff deep-linking |
| Repository filter | Extend `findByDateRange` | Single query, avoids extra round-trips | **Extend WHERE clause** — add optional `patientId` and `doctorId` params |
| PATIENT redirect | `<Navigate>` in App.jsx | Simplest, no extra route wrapper | **`<Navigate>`** — when `role === 'PATIENT' && path === '/dashboard'` |
| DENTIST auto-filter | Auto-set `selectedDoctorId` in AgendaPage | Keeps existing client-side filter logic | **Auto-set on mount** — derive `doctorId` from `user.id` when `role === 'DENTIST'` |

## Data Flow

```
PATIENT logs in
  ├─→ App.jsx: role=PATIENT → Navigate /dashboard → /appointments
  ├─→ AppSidebar: ROLE_MENU_ITEMS['PATIENT'] → [Agenda, Profile]
  └─→ AgendaPage: calls GET /v1/appointments/me
       └─→ backend: req.user.role=PATIENT → filter by patient_id=req.user.id

DENTIST logs in
  ├─→ AppSidebar: ROLE_MENU_ITEMS['DENTIST'] → all except Admin
  ├─→ AgendaPage: selectedDoctorId = user.id → filter client-side
  └─→ DashboardPage: shows today's schedule (not user list)

STAFF logs in
  └─→ Unchanged: full sidebar, full dashboard, query params optional
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `servicios/src/routes/v1/appointment.routes.ts` | Modify | Add `GET /me` before `GET /:id` |
| `servicios/src/controllers/appointment.controller.ts` | Modify | Add `getAll` query param parsing (`patient_id`, `doctor_id`); add `getMyAppointments` handler |
| `servicios/src/services/appointment.service.ts` | Modify | Pass `patientId` / `doctorId` through to repository |
| `servicios/src/repositories/appointment.repository.ts` | Modify | Extend `findByDateRange` WHERE clause with optional filters |
| `frontend/src/components/AppSidebar.jsx` | Modify | Replace ternary with `ROLE_MENU_ITEMS` lookup; add "Mi Perfil" placeholder |
| `frontend/src/App.jsx` | Modify | Add PATIENT redirect `/dashboard` → `/appointments` |
| `frontend/src/pages/AgendaPage.jsx` | Modify | Hide "Nuevo turno" for PATIENT; auto-select doctor for DENTIST; use `/me` for PATIENT |
| `frontend/src/pages/DashboardPage.jsx` | Modify | Role-based content: PATIENT → upcoming appointments; DENTIST → today's schedule; staff → user list |
| `frontend/src/services/appointmentService.js` | Modify | Add `getMyAppointments()` method; add `patientId`/`doctorId` to `getAll()` params |

## Interfaces / Contracts

### Backend — `GET /v1/appointments` (modified)
Query params: `start`, `end`, `patient_id` (optional), `doctor_id` (optional)

### Backend — `GET /v1/appointments/me` (new)
Requires `authenticateToken`. Filters by:
- `PATIENT` → `patient_id = req.user.id`
- `DENTIST` → `doctor_id = req.user.id`
- Other roles → returns all (same as unfiltered `/`)

### Repository — `findByDateRange(start, end, patientId?, doctorId?)`
```ts
where: {
  datetime: { gte: start, lte: end },
  ...(patientId && { patient_id: patientId }),
  ...(doctorId && { doctor_id: doctorId }),
}
```

### Frontend — `ROLE_MENU_ITEMS`
```js
const ROLE_MENU_ITEMS = {
  PATIENT: ['/appointments', '/profile'],
  DENTIST: ['/dashboard', '/doctors', '/patients', '/appointments', '/insurance', '/payments'],
  SECRETARY: [/* all + admin */],
  OWNER: [/* all + admin */],
  SUPER_ADMIN: [/* all + admin */],
};
```

### Frontend — `appointmentService.getMyAppointments(start, end)`
Calls `GET /v1/appointments/me?start=...&end=...`

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `appointment.repository.findByDateRange` with filters | Verify Prisma `where` object includes optional filters |
| Integration | `GET /v1/appointments/me` as PATIENT / DENTIST | Use authenticated request; assert only own appointments returned |
| Integration | `GET /v1/appointments?patient_id=X` | Assert filtered results; assert staff still sees all when omitted |
| E2E | PATIENT login → sidebar shows only Agenda | Puppeteer / Playwright: assert DOM elements |
| E2E | PATIENT visits `/dashboard` → redirects to `/appointments` | Assert URL change |

## Migration / Rollout

No migration required. All changes are additive:
- Query params are optional; existing `GET /v1/appointments` calls continue working.
- `/me` is a new route; no breaking changes.
- Frontend redirect is client-side only.

## Open Questions

- [ ] Should `req.user` in `authenticateToken` include the full `user_id`? (Verify current JWT payload includes `id`)
- [ ] Does `PATIENT` user have a `patient_id` in the JWT, or is it just `user.id`? (Prisma `User.id` == `patient_id` in appointment table)
