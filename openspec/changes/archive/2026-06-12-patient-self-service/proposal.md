# Proposal: Patient Self-Service View

## Intent

Restrict the dashboard and agenda to show only role-relevant data. PATIENT users currently see a full user list (privacy leak) and all sidebar items (confusing UX). DENTIST users also see the full user list. This change scopes each role to its own data and UI.

## Scope

### In Scope
- PATIENT sidebar: only Agenda + Mi Perfil (placeholder); redirect `/dashboard` → `/appointments`
- PATIENT agenda: show only their own appointments; hide "Nuevo turno" button
- DENTIST dashboard: remove full user list; show role-specific content (today's schedule)
- DENTIST agenda: pre-filter by logged-in doctor
- Backend: `GET /v1/appointments/me` auto-filters by logged-in user's patient_id/doctor_id
- Backend: optional `?patient_id=X` and `?doctor_id=X` query params on `GET /v1/appointments`

### Out of Scope
- Patient self-booking (whether PATIENT can create appointments)
- SECRETARY permission changes
- New database migrations (schema already supports patient_id/doctor_id)
- Payment or insurance modules

## Capabilities

### New Capabilities
- `appointment-self-filter`: Backend `/v1/appointments/me` endpoint and optional query-param filtering for patient_id/doctor_id

### Modified Capabilities
- `dashboard`: Role-specific content — PATIENT sees upcoming appointments, DENTIST sees today's schedule, staff sees user list (current)
- `sidebar`: Role-based menu items — PATIENT sees only Agenda + Mi Perfil
- `agenda`: Auto-filter appointments by patient_id/doctor_id from auth context; hide "Nuevo turno" for PATIENT

## Approach

Combine backend query-param filtering (Approach 2) with a `/me` convenience endpoint (Approach 3). Frontend passes role-specific IDs via auth context. No schema changes needed.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `servicios/src/controllers/appointment.controller.ts` | Modified | Add `patient_id`/`doctor_id` query parsing; add `/me` handler |
| `servicios/src/services/appointment.service.ts` | Modified | Pass optional patientId/doctorId filters |
| `servicios/src/repositories/appointment.repository.ts` | Modified | Extend `findByDateRange` WHERE clause |
| `servicios/src/routes/v1/appointment.routes.ts` | Modified | Add `GET /me` route |
| `frontend/src/components/AppSidebar.jsx` | Modified | Role-based `visibleMenuItems` filter |
| `frontend/src/pages/DashboardPage.jsx` | Modified | Role-specific content instead of full user list |
| `frontend/src/pages/AgendaPage.jsx` | Modified | Auto-filter by auth context; hide controls for PATIENT |
| `frontend/src/services/appointmentService.js` | Modified | Add `patientId`/`doctorId` params to `getAll()` |
| `frontend/src/App.jsx` | Modified | Redirect PATIENT `/dashboard` → `/appointments` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend deploy before frontend | Low | Query params are optional/backward-compatible |
| PATIENT still sees all appointments via old API | Low | `/v1/appointments` continues working; frontend switches to `/me` or filtered params |
| DENTIST missing patient data for dropdown | Med | Current scope only filters agenda; dropdown population is separate concern |

## Rollback Plan

1. Revert `appointment.routes.ts` to remove `/me` route
2. Revert `appointment.controller.ts` to ignore query params
3. Revert frontend files to previous `main` state (sidebar, dashboard, agenda, App.jsx)
4. All changes are additive; no migration needed

## Dependencies

- Existing `Appointment` Prisma model (patient_id, doctor_id fields)
- Existing `authenticateToken` middleware (req.user with role)
- Existing `useAuth()` hook (frontend role context)

## Success Criteria

- [ ] PATIENT sidebar shows only Agenda + Mi Perfil
- [ ] PATIENT `/dashboard` redirects to `/appointments`
- [ ] PATIENT agenda shows only their appointments
- [ ] PATIENT agenda hides "Nuevo turno" button
- [ ] DENTIST dashboard does NOT show full user list
- [ ] DENTIST agenda pre-filters by logged-in doctor
- [ ] `GET /v1/appointments/me` returns only appointments for the logged-in user (PATIENT by patient_id, DENTIST by doctor_id)
- [ ] `GET /v1/appointments?patient_id=X` returns only that patient's appointments
- [ ] `GET /v1/appointments?doctor_id=X` returns only that doctor's appointments
- [ ] Staff roles (SUPER_ADMIN, OWNER, SECRETARY) continue to see all appointments and all users
