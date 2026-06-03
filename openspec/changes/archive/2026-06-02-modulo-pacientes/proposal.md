# Proposal: modulo-pacientes

## Intent

Add a first-class **Patients module** so the clinic can manage patient profiles (DNI, coverage, contact data) separately from authentication/identity (`User`), and expose list/detail/update/delete flows in API + UI.

## Scope

### In Scope
- Prisma model `Patient` (1:1 with `User`) and migrations.
- Auto-create empty `Patient` profile when registering a `User` with `role=PATIENT`.
- Backfill existing `PATIENT` users without a `Patient` profile via a seed script.
- Backend CRUD + filtered listing endpoints under `/v1/patients` with role-based authorization.
- Frontend Patients page: table (search/filters/pagination), detail navigation, and edit modal.

### Out of Scope
- Persisting “assigned doctor” on patient (derived from `Appointment`).
- Storing last/next visit as fields (calculated from `Appointment`).
- Creating/owning the `Appointment` module itself (assumes it exists or will be added later).

## Capabilities

### New Capabilities
- `patient-profile`: Data model + invariants for `Patient` (1:1 to `User`, unique DNI, active flag).
- `patients-api`: `/v1/patients` endpoints (list with filters, detail with recent/next appointments, update, delete) + authz.
- `patients-ui`: Patients table page, filter bar, pagination, edit modal (shadcn/ui).
- `patient-backfill`: Seed/backfill routine for legacy `PATIENT` users.

### Modified Capabilities
- `user-registration`: When `role=PATIENT`, registration MUST also create the `Patient` profile.

## Approach

- Follow existing backend layering (routes → controller → service → repository) mirroring the doctor module.
- Prisma: introduce `Patient` with `user_id` unique FK; queries join `User` for search fields.
- Filters:
  - `search`: LIKE on `User.first_name`, `User.last_name`, `User.email`, `Patient.dni`
  - `obra_social`, `estado`: direct WHERE on `Patient`
  - `doctor_id`, `desde`, `hasta`: derive via `Appointment` subqueries/aggregations (last/next visit)
- Frontend: add `patientService.js`; implement `PatientsPage.jsx` + `PatientFormModal.jsx`; wire `/patients` route to real page.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `servicios/prisma/schema.prisma` | Modified | Add `Patient` model + relations |
| `servicios/prisma/migrations/*` | New | Migration for `Patient` |
| `servicios/prisma/seed-*.{js,ts}` | New/Modified | Backfill `PATIENT` users without profile |
| `servicios/src/{routes,controllers,services,repositories}/patient.*` | New | Patients module backend |
| `servicios/src/services/user.service.ts` | Modified | Auto-create `Patient` on `role=PATIENT` register |
| `frontend/src/pages/PatientsPage.jsx` | New | Patients list UI |
| `frontend/src/components/PatientFormModal.jsx` | New | Edit modal |
| `frontend/src/services/patientService.js` | New | API client |
| `frontend/src/App.jsx` | Modified | Route `/patients` → `PatientsPage` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Slow listing due to `Appointment` subqueries | Med | Add pagination; index-like strategies (query shape, limit computed fields), measure and simplify if needed |
| Backfill creates duplicates / violates unique constraints | Low | Validate `dni` presence/uniqueness; idempotent backfill keyed by `user_id` |
| Authorization gaps on update/delete | Med | Centralize role checks in controller/service; add negative tests via manual curl scripts |

## Rollback Plan

- Disable new `/v1/patients` routes and UI navigation (feature flag or revert commit).
- Revert Prisma migration and regenerate client; database rollback by restoring pre-migration `dev.db` snapshot in dev, and in prod by rolling back migration (manual SQLite file backup/restore).

## Dependencies

- `Appointment` table/model availability for doctor/date-derived filters and “last/next visit” fields.

## Success Criteria

- [ ] Registering a `PATIENT` user creates a linked `Patient` row.
- [ ] Backfill script is idempotent and results in every `PATIENT` user having exactly one `Patient`.
- [ ] `/v1/patients` list supports search + filters and returns stable pagination.
- [ ] UI `/patients` shows list, filters work, and edit persists via PUT with correct authorization.
