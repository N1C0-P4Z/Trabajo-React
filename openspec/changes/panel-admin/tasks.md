# Tasks: Admin Panel with KPIs and User Management

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 750–850 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Backend Foundation (~120) → PR 2: Frontend KPI + Routing (~280) → PR 3: Frontend CRUD + SECRETARY (~350) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: stats endpoint + auth fix + delete guards + role update + SECRETARY patient routes | PR 1 | ~120 lines, testable via curl, no frontend dependency |
| 2 | Frontend: KPI cards + sidebar admin item + admin route guard + services | PR 2 | ~280 lines, PR 1 base required for stats endpoint |
| 3 | Frontend: UserFormModal + AdminPage CRUD table + SECRETARY page permissions | PR 3 | ~350 lines, PR 2 base required for AdminPage |

---

## Phase 1: Backend Foundation

- [x] 1.1 `user.repository.ts` — Add `countByRole(role)` method for last-SUPER_ADMIN guard [Req 6]
- [x] 1.2 `stats.service.ts` — Create with Prisma aggregations: count patients by role, count DENTISTs, count today/pending appointments [Req 3]
- [x] 1.3 `stats.controller.ts` — Create `getDashboardStats` handler calling stats service [Req 3]
- [x] 1.4 `stats.routes.ts` — Create `GET /v1/stats` with `authenticateToken` + `requireRole('SUPER_ADMIN','OWNER','SECRETARY')` [Req 3]
- [x] 1.5 `routes/v1/index.ts` — Register stats router at `/stats` [Req 3]
- [x] 1.6 `user.routes.ts` — Add `authenticateToken` to `GET /` and `GET /:id` [Req 4]
- [x] 1.7 `user.service.ts` — Add `role` field to `updateUser` with validation (reject invalid roles) [Req 5]
- [x] 1.8 `user.service.ts` — Add self-deletion guard (403) and last-SUPER_ADMIN guard (403) in `deleteUser` [Req 6]
- [x] 1.9 `user.controller.ts` — Parse `role` from body in `updateUser` handler [Req 5]
- [x] 1.10 `patient.routes.ts` — Add `'SECRETARY'` to `PUT /:id` allowed roles; keep delete as SUPER_ADMIN+OWNER [Req 7]

## Phase 2: Frontend Admin Page

- [x] 2.1 `statsService.js` — Create with `getStats()` fetch wrapper for `GET /v1/stats` [Req 1,3]
- [x] 2.2 `userService.js` — Add `createUser(data)` (general) and `updateUser(id, data)` methods [Req 2]
- [x] 2.4 `AdminPage.jsx` — Add user table: username, email, role, actions (edit/delete) [Req 2]
- [x] 2.5 `AdminPage.jsx` — Add "Create User" button + delete confirmation dialog [Req 2,6]
- [x] 2.6 `UserFormModal.jsx` — Create: username, email, names, phone, password, role dropdown (all 5 roles), create/edit dual mode [Req 2]
- [x] 2.7 `App.jsx` — Add `/admin` route with `RoleProtectedRoute(['SUPER_ADMIN','OWNER','SECRETARY'])` [Req 9]
- [x] 2.8 `AppSidebar.jsx` — Conditionally add "Admin" nav item for SUPER_ADMIN, OWNER, SECRETARY [Req 8]

## Phase 3: SECRETARY Permissions

- [x] 3.1 `PatientsPage.jsx` — Allow `isAdmin` logic to include SECRETARY for create/edit; hide delete for SECRETARY [Req 7]
- [x] 3.2 `DoctorsPage.jsx` — Hide create/edit/delete buttons when role is SECRETARY (read-only) [Req 7]
- [x] 3.3 `App.jsx` — Add `SECRETARY` to `/patients` route guard; add `SECRETARY` to `/doctors` and `/doctors/:id` route guards [Req 7]

## Phase 4: Verification

- [ ] 4.1 Curl: `GET /v1/stats` returns correct shape (200), 401 without auth, 403 for PATIENT/DENTIST [Req 3]
- [ ] 4.2 Curl: `GET /v1/users` and `GET /v1/users/:id` return 401 without auth cookie [Req 4]
- [ ] 4.3 Curl: `PUT /v1/users/:id` with `{role}` updates user; invalid role returns 400 [Req 5]
- [ ] 4.4 Curl: `DELETE /v1/users/:id` blocks self-deletion and last-SUPER_ADMIN (both 403) [Req 6]
- [ ] 4.5 Manual: AdminPage KPIs render correct data (including 0 on empty DB) [Req 1]
- [ ] 4.6 Manual: Full user CRUD flow — create, edit, delete from admin panel [Req 2]
- [ ] 4.7 Manual: SECRETARY can read/create patients (no delete); read-only doctors [Req 7]
- [ ] 4.8 Visual: Sidebar "Admin" visible for SUPER_ADMIN/OWNER/SECRETARY, hidden for DENTIST/PATIENT [Req 8]
- [ ] 4.9 Visual: `/admin` redirects DENTIST/PATIENT to dashboard; unauthenticated to login [Req 9]
