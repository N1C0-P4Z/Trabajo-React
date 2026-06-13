# Tasks: Patient Profile Page

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280–350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | PatientProfilePage + routing + navigation | PR 1 (single) | All tasks in one PR, frontend only |

## Phase 1: Create PatientProfilePage component

- [x] 1.1 Create `frontend/src/pages/PatientProfilePage.jsx` with three-state lifecycle: loading (spinner), error/not-found (message + "Volver a Pacientes" button), and success (full layout)
- [x] 1.2 Implement breadcrumb: Inicio → Pacientes → {patient.user.first_name} {patient.user.last_name} with Links to `/dashboard` and `/patients`
- [x] 1.3 Implement profile header: Avatar (size-20, initials fallback), full name, DNI subtitle, active/inactive Badge, "Ver Agenda" button (`/appointments?patientId={patient.user_id}`), "Volver" button (`/patients`)
- [x] 1.4 Implement `<dl>` info grid (2-col on sm+) with 12 fields from `patient` + `patient.user`; render "—" for null values
- [x] 1.5 Implement appointment history section fetching `appointmentService.getAll(null, null, { patientId: patient.user_id })`; render list of date/status/doctor, empty state ("Este paciente no tiene turnos registrados."), and error state (non-crashing)
- [x] 1.6 Add self-scoping guard: if `user.role === 'PATIENT'` and `user.id !== patient.user_id`, show 403 forbidden message

## Phase 2: Wire routing and navigation

- [x] 2.1 Add import and route in `App.jsx`: `<Route path="/patients/:id">` wrapping `<PatientProfilePage>` in `<RoleProtectedRoute>` with allowed roles `['SUPER_ADMIN', 'OWNER', 'SECRETARY', 'PATIENT']`
- [x] 2.2 Enable Eye button in `PatientsPage.jsx`: import `useNavigate`, add `navigate(\`/patients/${patient.id}\`)` onClick handler, remove `disabled` prop
- [x] 2.3 Handle PATIENT self-view in `ProfilePage.jsx`: add useEffect that for PATIENT role calls `patientService.getAll({ search: user.email })` and if a matching patient record is found, redirects to `/patients/{patient.id}`; keeps current placeholder as fallback if no patient record exists

## Phase 3: Verify existing services

- [x] 3.1 Verify `patientService.getById(id)` returns nested `user` data (already exists, no changes needed)
- [x] 3.2 Confirm `appointmentService.getAll(null, null, { patientId })` supports patient filtering (already exists, no changes needed)