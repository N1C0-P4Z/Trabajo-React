# Apply Progress: modulo-pacientes

**PR**: 1 of 3 — Backend (Schema + CRUD + Auto-creation + Backfill)
**Mode**: Standard (Strict TDD disabled)
**Branch**: feature/pacientes
**Chain strategy**: feature-branch-chain

## Completed Tasks (Phase 1 + Phase 2)

### Phase 1: Schema + Backend CRUD
- [x] 1.1 — Add Patient model to schema.prisma (15 lines, 1:1 relation to User)
- [x] 1.2 — Create Prisma migration `add_patient_model` (SQLite)
- [x] 1.3 — Create patient.repository.ts with publicSelect, findAll with filters (search, obra_social, doctor_id, date range, estado, pagination), findByDni, softDelete
- [x] 1.4 — Create patient.service.ts with listPatients (batch computed visits), getPatientById, updatePatient (authz + validation), deletePatient (soft delete)
- [x] 1.5 — Create patient.controller.ts with list, getById, update, delete (async + try/catch + next(error))
- [x] 1.6 — Create patient.routes.ts + wire in routes/v1/index.ts (/v1/patients)
- [x] 1.7 — Prisma generate + tsc build — both pass clean

### Phase 2: Auto-creation + Backfill
- [x] 2.1 — Auto-create PatientProfile in userService.register() when role=PATIENT (dni fallback: PENDIENTE-{userId})
- [x] 2.2 — Create seed-backfill-patients.js script (idempotent, creates PatientProfile for existing PATIENTs with BACKFILL-{userId} DNI)
- [x] 2.3 — Ran backfill: 2 pacientes existentes creados (juan peres, Test Patient)

## Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| servicios/prisma/schema.prisma | Modified | Added Patient model with 1:1 relation to User |
| servicios/prisma/migrations/20260602202832_add_patient_model/ | Created | SQLite migration for Patient table |
| servicios/src/repositories/patient.repository.ts | Created | Full CRUD + search/filter/pagination |
| servicios/src/services/patient.service.ts | Created | Business logic + computed visit fields |
| servicios/src/controllers/patient.controller.ts | Created | Request handlers |
| servicios/src/routes/v1/patient.routes.ts | Created | Route definitions with auth + role middleware |
| servicios/src/routes/v1/index.ts | Modified | Added patientRoutes |
| servicios/src/services/user.service.ts | Modified | Auto-create PatientProfile on PATIENT registration |
| servicios/prisma/seed-backfill-patients.js | Created | Idempotent backfill script |

## Verification
- ✅ Prisma generate — passed
- ✅ tsc build — passed (0 errors)
- ✅ Migration applied — dev.db updated
- ✅ Backfill run — 2 PatientProfiles created
