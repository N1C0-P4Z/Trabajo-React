# Tasks: modulo-pacientes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1020 (additions + deletions) |
| 400-line budget risk | **High** |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Backend ~435) → PR 2 (Frontend Page ~330) → PR 3 (Modal ~260) |
| Delivery strategy | ask-always |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: schema + CRUD + auto-create + backfill | PR 1 → main | Testable via curl; includes migration |
| 2 | Frontend: patientService + PatientsPage + route | PR 2 → main | Depends on PR 1; table + filters + pagination |
| 3 | Frontend: PatientFormModal + wire into page | PR 3 → main | Depends on PR 2; edit modal with validation |

## Phase 1: Schema + Backend CRUD (~435 lines)

- [x] 1.1 Add `Patient` model to `servicios/prisma/schema.prisma` — `user_id` (unique FK), `dni` (unique), `obra_social`, `numero_afiliado`, `fecha_nacimiento`, `direccion`, `telefono_alternativo`, `is_active`, `created_at`; add `patient` relation on `User`
- [x] 1.2 Run `npx prisma migrate dev --name add-patient-model` and `npx prisma generate`
- [x] 1.3 Create `servicios/src/repositories/patient.repository.ts` — `create`, `findByUserId`, `findByDni`, `findById` (include User), `findAll` (search/filters/pagination), `count`, `update`, `softDelete`
- [x] 1.4 Create `servicios/src/services/patient.service.ts` — `listPatients` (filters + computed visit fields), `getPatientById`, `updatePatient` (authz + dni uniqueness), `deletePatient` (authz + soft-delete)
- [x] 1.5 Create `servicios/src/controllers/patient.controller.ts` — `list`, `getById`, `update`, `delete`; parse params/query, call service, `next(error)` pattern
- [x] 1.6 Create `servicios/src/routes/v1/patient.routes.ts` — `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id` with `authenticateToken` middleware
- [x] 1.7 Register `patientRoutes` in `servicios/src/routes/v1/index.ts` — add import + `router.use('/patients', patientRoutes)

## Phase 2: Auto-creation + Backfill (~50 lines)

- [x] 2.1 Modify `servicios/src/services/user.service.ts` `register()` — after `userRepository.create`, if `role === 'PATIENT'`, call `patientRepository.create({ user_id: newUser.id, dni: '' })` (empty defaults)
- [x] 2.2 Create `servicios/prisma/seed-backfill-patients.js` — find all Users with `role=PATIENT`, for each without a Patient row create one; idempotent (skip if exists)
- [x] 2.3 Verify: `curl` register a new PATIENT user → confirm Patient row exists; run backfill twice → confirm no duplicates

## Phase 3: Frontend Page + Service (~330 lines)

- [x] 3.1 Create `frontend/src/services/patientService.js` — `getAll(filters)`, `getById(id)`, `update(id, data)`, `delete(id)` using `API_BASE` + `credentials: 'include'`
- [x] 3.2 Create `frontend/src/pages/PatientsPage.jsx` — table with columns (Paciente/avatar+name+email, DNI, Cobertura, Última Visita, Próximo Turno, Acciones visibility+edit), search input, filter bar (obra social dropdown, estado dropdown, doctor dropdown, date range), pagination controls (Mostrando X a Y de Z), breadcrumb, loading/empty/error states
- [x] 3.3 Modify `frontend/src/App.jsx` — replace `/patients` placeholder div with `<PatientsPage />` (accessible to all authenticated users, not role-restricted)

## Phase 4: Frontend Edit Modal (~260 lines)

- [x] 4.1 Create `frontend/src/components/PatientFormModal.jsx` — shadcn Dialog + react-hook-form + zod; fields: dni, obra_social, numero_afiliado, fecha_nacimiento, direccion, telefono_alternativo, is_active
- [x] 4.2 Wire `PatientFormModal` into `PatientsPage.jsx` — add edit button per row, open modal with patient data, refresh list on save
- [x] 4.3 Verify: open modal → edit dni/obra_social → save → table updates; confirm 403 on non-admin
