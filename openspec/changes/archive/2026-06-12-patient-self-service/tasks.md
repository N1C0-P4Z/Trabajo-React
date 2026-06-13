# Tasks: Patient Self-Service

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 310–420 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: Backend — Repository filter propagation

- [x] 1.1 Extend `appointment.repository.findByDateRange(start, end, patientId?, doctorId?)` — add optional `patient_id`/`doctor_id` to Prisma `where` clause
- [x] 1.2 Modify `appointment.service.getByRange(start, end, patientId?, doctorId?)` to forward optional filters to repository
- [x] 1.3 Add `appointment.service.getMyAppointments(role, userId, start, end)` — dispatches `patient_id` or `doctor_id` based on role; staff returns all

## Phase 2: Backend — Controller + Route

- [x] 2.1 Add `patient_id`/`doctor_id` query param parsing in `appointment.controller.getAll`
- [x] 2.2 Add `appointment.controller.getMyAppointments` — reads `req.user` role/id, calls service
- [x] 2.3 Register `GET /me` before `GET /:id` in `appointment.routes.ts`

## Phase 3: Frontend — Sidebar role-based items

- [x] 3.1 Create `ROLE_MENU_ITEMS` lookup object in `AppSidebar.jsx` mapping each role to visible paths
- [x] 3.2 Replace ternary `ADMIN_ROLES.includes` with `ROLE_MENU_ITEMS[user.role]` filter
- [x] 3.3 Add `{ title: 'Mi Perfil', path: '/profile', icon: User }` to PATIENT menu items
- [x] 3.4 Create `frontend/src/pages/ProfilePage.jsx` placeholder (future patient profile editing)

## Phase 4: Frontend — Dashboard redirect + role scoping

- [x] 4.1 In `App.jsx`, add `<Navigate to="/appointments" />` redirect for PATIENT on `/dashboard`
- [x] 4.2 Add `/profile` route inside protected `DashboardLayout` in `App.jsx`
- [x] 4.3 Rewrite `DashboardPage.jsx` — PATIENT shows upcoming appointments, DENTIST shows today's schedule, staff shows user list (current)

## Phase 5: Frontend — AgendaPage role scoping

- [x] 5.1 Add `appointmentService.getMyAppointments(start, end)` calling `GET /v1/appointments/me`
- [x] 5.2 Add `patientId`/`doctorId` params to `appointmentService.getAll()`
- [x] 5.3 In `AgendaPage.jsx`, import `useAuth`; PATIENT calls `getMyAppointments`, DENTIST auto-sets `selectedDoctorId = user.id`
- [x] 5.4 Hide "Nuevo turno" button and doctor filter dropdown when role is `PATIENT`

## Phase 6: Verification

- [x] 6.1 Run `npm run build` on backend and frontend — verify no type/compilation errors
- [ ] 6.2 Test `GET /v1/appointments/me` as PATIENT — assert only own appointments returned
- [ ] 6.3 Test `GET /v1/appointments/me` as DENTIST — assert only own appointments returned
- [ ] 6.4 Test `GET /v1/appointments?patient_id=X` and `?doctor_id=X` — assert filtered + 400 on invalid
- [ ] 6.5 Manual E2E: PATIENT login → sidebar (2 items) → /dashboard redirect → agenda (no "Nuevo turno")
- [ ] 6.6 Manual E2E: DENTIST login → dashboard (no user list) → agenda (pre-selected self)