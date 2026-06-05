# Design: modulo-pacientes

## Technical Approach

Add `Patient` as a 1:1 extension of `User` (role=PATIENT). Follow the existing 4-layer backend pattern (routes→controller→service→repository) and existing frontend patterns (page+modal+service). Auto-create empty `Patient` on `userService.register()` when `role=PATIENT`. Computed visit fields derived from `Appointment` via Prisma aggregations — never stored.

## Architecture Decisions

### Decision: Separate Patient model vs embedded User fields

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Patient model 1:1 to User | Extra join; clean separation of identity vs clinical data | **Chosen** |
| Add all fields to User | Simpler queries; sparse columns for non-patients; violates single responsibility | Rejected |

**Rationale**: User = authentication/identity. Patient = clinical profile (DNI, obra social, etc.). Clean domain boundary.

### Decision: Computed `last_visit_at` / `next_visit_at` vs stored columns

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Compute via Prisma aggregation | Live data; one extra query on detail view | **Chosen** |
| Store as Patient columns | Faster reads; requires update triggers/sync logic | Rejected |

**Rationale**: Appointment is source of truth. Detail queries are low-frequency. Avoids stale data bugs.

### Decision: Soft delete (is_active=false) vs hard delete

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Soft delete | Preserves referential integrity; matches project pattern | **Chosen** |
| Hard delete | Cleaner DB; breaks Appointment history | Rejected |

### Decision: Doctor filter via Appointment subquery vs stored column

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Prisma `some` on `user.patient_appointments` | Slightly heavier query; no sync maintenance | **Chosen** |
| Add `assigned_doctor_id` to Patient | Faster read; requires update on every appointment change | Rejected |

## Data Flow

```
PatientsPage ──GET /v1/patients────────────────► patientController.list
     │  search, obra_social, doctor_id,            │
     │  desde, hasta, estado, pagina, limite       ▼
     │                                      patientService.listPatients
     │                                             │
     │                                             ▼
     │                                      patientRepository.findAll
     │                                      ┌─ include User (name/email)
     │                                      ├─ search: User.first_name/last_name/email LIKE
     │                                      ├─ search: Patient.dni LIKE
     │                                      ├─ obra_social/estado: direct WHERE
     │                                      ├─ doctor_id: Appointment subquery (some)
     │                                      └─ desde/hasta: Appointment subquery (some)
     │                                             │
     ▼                                             ▼
  { data, total, pagina, limite } ◄────────  Prisma query + count


PatientFormModal ──PUT /v1/patients/:id────► patientController.update
     │  dni, obra_social, etc.                 │
     │                                          ▼
     │                                  patientService.updatePatient
     │                                  1. Validate ID + authz role
     │                                  2. Validate dni uniqueness
     │                                  3. patientRepository.update
     │                                          │
     ▼                                          ▼
  toast.success ◄──────────────────────  { updated Patient }


User registration (role=PATIENT):
  userService.register()
      └─ userRepository.create(User)
      └─ if role === 'PATIENT':
            patientRepository.create({ user_id: newUser.id, ...defaults })
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `servicios/prisma/schema.prisma` | Modify | Add `Patient` model + `User.patient` relation |
| `servicios/prisma/migrations/*` | New | Auto-generated migration |
| `servicios/prisma/seed-backfill-patients.js` | New | Idempotent backfill for legacy PATIENT users |
| `servicios/src/repositories/patient.repository.ts` | New | Prisma queries: create, findByUserId, findByDni, findAll (filters+pagination), update, softDelete, count |
| `servicios/src/services/patient.service.ts` | New | Validation, computed fields (last/next visit), authorization checks |
| `servicios/src/controllers/patient.controller.ts` | New | Request parsing, response formatting, next(error) |
| `servicios/src/routes/v1/patient.routes.ts` | New | Route definitions with auth + role middleware |
| `servicios/src/routes/v1/index.ts` | Modify | Add `patientRoutes` |
| `servicios/src/services/user.service.ts` | Modify | Auto-create `Patient` on `register()` when `role=PATIENT` |
| `frontend/src/services/patientService.js` | New | API client: list, getById, update |
| `frontend/src/pages/PatientsPage.jsx` | New | Table page: filters, pagination, breadcrumb |
| `frontend/src/components/PatientFormModal.jsx` | New | Edit modal: react-hook-form + zod + shadcn Dialog |
| `frontend/src/App.jsx` | Modify | Replace placeholder route with `<PatientsPage />` |

## Interfaces / Contracts

```typescript
// Patient record (service → controller → client)
interface PatientResponse {
  id: number;
  user_id: number;
  dni: string;
  obra_social: string | null;
  numero_afiliado: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  telefono_alternativo: string | null;
  is_active: boolean;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    avatar_url: string | null;
  };
  last_visit_at: string | null;   // computed
  next_visit_at: string | null;   // computed
}

// List response
interface PatientListResponse {
  data: PatientResponse[];
  total: number;
  pagina: number;
  limite: number;
}

// GET /v1/patients query params
// search?: string, obra_social?: string, doctor_id?: number,
// desde?: ISO-date, hasta?: ISO-date, estado?: 'active'|'inactive',
// pagina?: number (default 1), limite?: number (default 10)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Repository | findAll filters, count, create, update, softDelete | Manual curl against running backend |
| Service | Validation (dni uniqueness, authz rejections), computed fields logic | Manual curl + inspect responses |
| Controller | Status codes, error format, empty/null responses | Manual curl — all scenarios from spec |
| Frontend | Table rendering, filter interactions, modal edit/save | Manual browser verification |
| Integration | Auto-create on registration, backfill idempotency | Manual curl: register PATIENT user → check Patient exists; run backfill twice → verify count unchanged |

> Note: No automated test suite configured in this project. Tests are manual verification via curl + browser.

## Migration / Rollout

1. Run `npx prisma migrate dev --name add-patient-model` — creates migration from schema change.
2. Run `node prisma/seed-backfill-patients.js` — backfills existing PATIENT users.
3. Deploy: `npm run build` (both servicios + frontend), SCP dist/ + prisma/ to server.
4. Rollback: revert migration (`prisma migrate resolve --rolled-back`), restore pre-migration `dev.db` snapshot.

## Open Questions

- [ ] Should `obra_social` be a free-text field or a lookup table (ObraSocial model)? Free-text for now — simple and matches spec scope.
- [ ] Should `numero_afiliado` uniqueness be enforced within an obra_social? Not in scope — spec only enforces dni uniqueness.
