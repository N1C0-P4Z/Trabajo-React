# Archive Report: modulo-pacientes

**Archived:** 2026-06-02
**Branch:** feature/pacientes
**SDD Cycle:** Complete (Proposal → Spec → Design → Tasks → Apply → Archive)

---

## Executive Summary

The modulo-pacientes change introduced a first-class **Patients module** to the clinic management system. It added a `Patient` model (1:1 with `User`), full backend CRUD with search/filter/pagination, computed appointment-derived fields (`last_visit_at`, `next_visit_at`), auto-creation of patient profiles on user registration, idempotent backfill for legacy users, and a complete frontend UI with directory table, filters, and edit modal.

**13/13 tasks completed** across 4 phases. All verification checks passed: Prisma generate, tsc build, Vite build, and manual curl/browser verification.

---

## Artifact Traceability

| Artifact | File | Status | Key Content |
|----------|------|--------|-------------|
| **Proposal** | `proposal.md` | ✅ Complete | Intent, scope, 4 capabilities, risks, success criteria |
| **Spec** | `spec.md` | ✅ Complete | 8 requirements with BDD scenarios |
| **Design** | `design.md` | ✅ Complete | 4 architecture decisions, data flow diagrams, interfaces, testing strategy |
| **Tasks** | `tasks.md` | ✅ Complete | 13 tasks across 4 phases, all marked done |
| **Apply Progress** | `apply-progress.md` | ✅ Complete | Full implementation tracking, all phases verified |
| **Archive Report** | `archive-report.md` | ✅ Present | This document |

**No verify-report file was created separately** — verification results are embedded in `apply-progress.md` (lines 50-58) and `design.md` (testing strategy section).

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Patient data model | Separate `Patient` model (1:1 to `User`) | Clean separation of identity vs clinical data |
| Visit timestamps | Computed via Prisma aggregation (`last_visit_at`, `next_visit_at`) | Appointment is source of truth; avoids stale data |
| Deletion strategy | Soft delete (`is_active = false`) | Preserves referential integrity; matches project pattern |
| Doctor filter | Prisma `some` on Appointment relation | No sync maintenance needed |
| Obra social field | Free-text | Simple, matches scope; upgradable to lookup later |
| Delivery strategy | Feature branch chain (single PR) | ~1020 added lines, manageable as single feature branch |

---

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| `modulo-pacientes` | Created | Copied to `openspec/specs/modulo-pacientes/spec.md` — full spec, no delta merge needed |

---

## Files Changed (Cumulative)

| File | Action |
|------|--------|
| `servicios/prisma/schema.prisma` | Modified — Added `Patient` model |
| `servicios/prisma/migrations/*` | New — SQLite migration |
| `servicios/prisma/seed-backfill-patients.js` | New — Idempotent backfill |
| `servicios/src/repositories/patient.repository.ts` | New — Full CRUD + filters |
| `servicios/src/services/patient.service.ts` | New — Business logic |
| `servicios/src/controllers/patient.controller.ts` | New — Request handlers |
| `servicios/src/routes/v1/patient.routes.ts` | New — Route definitions |
| `servicios/src/routes/v1/index.ts` | Modified — Added patient routes |
| `servicios/src/services/user.service.ts` | Modified — Auto-create Patient on registration |
| `frontend/src/services/patientService.js` | New — API client |
| `frontend/src/pages/PatientsPage.jsx` | New — Directory table + filters |
| `frontend/src/components/PatientFormModal.jsx` | New — Edit modal |
| `frontend/src/App.jsx` | Modified — Added `/patients` route |

---

## Lessons Learned

1. **No separate verify-report was generated** — verification steps were embedded in apply-progress and design docs. For future changes, generating a dedicated verify-report post-apply would improve traceability.
2. **Architecture decision documentation was strong** — the 4 decisions in design.md with options/tradeoffs/decisions table were clear and actionable.
3. **Manual testing sufficed** as no automated test suite exists in the project. All scenarios from the spec were verifiable via curl + browser.
4. **Backfill script was critical** — existing PATIENT users needed profiles. The idempotent design (`BACKFILL-{userId}` DNI fallback) prevented duplicate issues when run multiple times.
5. **Computed visit fields** correctly deferred to `Appointment` as source of truth — no sync bugs possible.

---

## Archive Contents

- `proposal.md` ✅
- `spec.md` ✅ (8 requirements, all scenarios verifiable)
- `design.md` ✅ (4 decisions, 13 files changed)
- `tasks.md` ✅ (13/13 tasks complete)
- `apply-progress.md` ✅ (all phases verified)
- `archive-report.md` ✅

## SDD Cycle Complete

The modulo-pacientes change has been fully planned, designed, implemented, and verified. All artifacts archived. Spec promoted to `openspec/specs/modulo-pacientes/spec.md` as source of truth.
