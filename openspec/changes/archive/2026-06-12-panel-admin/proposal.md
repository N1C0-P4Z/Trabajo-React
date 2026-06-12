# Proposal: Admin Panel with KPIs and User Management

## Intent

The current system lacks a centralized administrative dashboard. The existing `DashboardPage` is misnamed and functions as an unprotected user list with no create/edit capabilities. This change introduces a dedicated `/admin` panel where SUPER_ADMIN, OWNER, and SECRETARY roles can view key business KPIs and perform full user CRUD operations securely.

## Scope

### In Scope
- New `/admin` route and `AdminPage` with KPI cards (total patients, total doctors, today's appointments, pending appointments, monthly income placeholder)
- Full user CRUD (create, edit, delete) via the admin panel
- Role update support in backend (`PUT /v1/users/:id` must accept `role`)
- Backend stats aggregation endpoint (`GET /v1/stats`)
- Add authentication middleware to `GET /v1/users` and `GET /v1/users/:id` (security fix)
- Backend protections: prevent self-deletion, prevent deletion of the last SUPER_ADMIN
- Conditional "Admin" sidebar item for SUPER_ADMIN, OWNER, SECRETARY
- SECRETARY permissions: read/write Patients (no delete), read-only Doctors
- Update `DoctorsPage` and `PatientsPage` route guards to include SECRETARY with appropriate permissions

### Out of Scope
- Patient self-service (view-only own agenda) — deferred to future change
- Full redesign of existing `DashboardPage` — it remains as a lightweight entry point
- Real payments module — income KPI is a placeholder

## Capabilities

### New Capabilities
- `admin-panel`: Frontend page and sidebar navigation for admin KPIs and user management
- `stats-endpoint`: Backend API to aggregate and return business KPIs
- `user-management`: Full CRUD with role updates and safety guards

### Modified Capabilities
- `modulo-pacientes`: Update route guards and page-level permissions to accommodate SECRETARY role

## Approach

Implement a dedicated admin panel as a new React page (`AdminPage.jsx`) under `/admin`, protected by `RoleProtectedRoute`. Build a backend `stats` module (route, controller, service) using Prisma aggregation queries on `User`, `Patient`, and `Appointment` tables. Extend the existing user service to support `role` field updates and add safety checks for self-deletion and last-SUPER_ADMIN protection. Add `authenticateToken` to `GET /v1/users` read routes to close the security gap. Update `App.jsx` route guards and `AppSidebar.jsx` to conditionally render the admin entry point.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/App.jsx` | Modified | Add `/admin` route with `RoleProtectedRoute`; update `/doctors` and `/patients` guards |
| `frontend/src/components/AppSidebar.jsx` | Modified | Add conditional "Admin" menu item for authorized roles |
| `frontend/src/pages/AdminPage.jsx` | New | KPI dashboard + user CRUD table with create/edit/delete modals |
| `frontend/src/services/statsService.js` | New | Fetch wrapper for `GET /v1/stats` |
| `frontend/src/services/userService.js` | Modified | Ensure create/edit methods align with new backend capabilities |
| `servicios/src/routes/v1/stats.routes.ts` | New | `GET /v1/stats` endpoint |
| `servicios/src/controllers/stats.controller.ts` | New | KPI aggregation logic |
| `servicios/src/services/stats.service.ts` | New | Prisma queries for stats |
| `servicios/src/routes/v1/user.routes.ts` | Modified | Add `authenticateToken` to `GET /` and `GET /:id`; add role to update payload |
| `servicios/src/services/user.service.ts` | Modified | Support `role` field in `updateUser`; add guards for self/last-admin deletion |
| `servicios/src/controllers/user.controller.ts` | Modified | Parse `role` from update body; wire new service guards |
| `servicios/src/routes/v1/index.ts` | Modified | Register `stats` router |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Adding auth to `GET /v1/users` breaks existing unauthenticated callers | Low | All current callers are inside `ProtectedRoute`; cookies will be sent. Verify with smoke tests |
| Admin changes own role or deletes self, breaking session | Low | Backend must reject self-deletion and self-demotion from SUPER_ADMIN |
| Last SUPER_ADMIN is deleted or demoted, locking the system | Low | Backend guard: reject deletion/demotion if it would leave zero SUPER_ADMINs |
| SECRETARY gains unintended write access to Doctors | Low | Update DoctorsPage UI to disable create/edit/delete for SECRETARY; guard at API level too |
| Stats queries slow down as data grows | Low | SQLite handles small-to-medium volumes; monitor query times |

## Rollback Plan

1. Revert the Git commit(s) for this change.
2. If revert is not clean, manually remove new files (`AdminPage.jsx`, `statsService.js`, `stats.routes.ts`, `stats.controller.ts`, `stats.service.ts`).
3. Restore `App.jsx`, `AppSidebar.jsx`, `user.routes.ts`, and `user.service.ts` from the previous known-good state.
4. Restart the backend (`npm start` or PM2 restart).
5. Verify that the original `/dashboard` and existing routes work without the `/admin` route.

## Dependencies

- None external. All dependencies (Prisma, Express, React) are already in the project.

## Success Criteria

- [ ] `/admin` is accessible only to SUPER_ADMIN, OWNER, and SECRETARY
- [ ] Admin panel displays 5 KPI cards with correct data (or placeholder for income)
- [ ] Admin can create users with any role
- [ ] Admin can edit users including changing their role
- [ ] Admin can delete users, but cannot delete themselves
- [ ] Backend prevents deletion of the last SUPER_ADMIN (returns 403)
- [ ] `GET /v1/users` requires authentication (returns 401 without cookie)
- [ ] SECRETARY can access `/patients` and `/doctors` but cannot modify doctors
- [ ] Sidebar shows "Admin" item only for authorized roles
