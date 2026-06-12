## Exploration: panel-admin

### Current State

#### 1. Sidebar (AppSidebar.jsx)
- Renders a fixed array of 6 menu items unconditionally — no role-based visibility
- Items: Dashboard, Doctores, Pacientes, Agenda, Obras Sociales, Pagos
- Uses `useAuth()` hook (has `user.role` available) but never checks it
- No "Admin" item exists

#### 2. Routes (App.jsx)
- `/dashboard` — DashboardPage — **no role guard** (any authenticated user)
- `/doctors` — DoctorsPage — `RoleProtectedRoute(['SUPER_ADMIN', 'OWNER'])`
- `/doctors/:id` — DoctorProfilePage — `RoleProtectedRoute(['SUPER_ADMIN', 'OWNER'])`
- `/patients` — PatientsPage — **no role guard** (any authenticated user)
- `/appointments` — AgendaPage — **no role guard** (any authenticated user)
- `/insurance` — static placeholder
- `/payments` — static placeholder
- No `/admin` route exists

#### 3. Authentication & Roles (AuthContext.jsx)
- `user` object contains `role` field from `/v1/auth/me`
- `useAuth()` hook exposes: `user`, `isAuthenticated()`, `login()`, `logout()`
- `ProtectedRoute` gates authentication, `RoleProtectedRoute` gates by `allowedRoles`
- Backend: `authenticateToken` (cookie JWT) + `requireRole(...roles)` middleware
- Roles: SUPER_ADMIN, OWNER, DENTIST, SECRETARY, PATIENT

#### 4. Current DashboardPage (misnamed)
- Actually shows **user management**: lists ALL users in a table with a delete button
- Delete button only rendered for `SUPER_ADMIN`/`OWNER` (client-side check)
- **No create/edit user form** — only list + delete
- **No route-level role guard** — any authenticated user can access
- Backend: `GET /v1/users` has **no auth middleware** at all (security gap)

#### 5. User Management API (Backend)
- `POST /v1/users` — requires `SUPER_ADMIN` or `OWNER`
- `PUT /v1/users/:id` — requires `SUPER_ADMIN` or `OWNER`
- `DELETE /v1/users/:id` — requires `SUPER_ADMIN` or `OWNER`
- `GET /v1/users` — **NO AUTH** (security gap — any unauthenticated request can list all users)
- `GET /v1/users/:id` — **NO AUTH**
- `userService.updateUser()` supports: `first_name`, `last_name`, `phone`, `email`, `specialty`, `license_number`, `is_active`, `avatar_url`
- **Role field is NOT updatable** via `updateUser` — no `data.role` handling

#### 6. PatientsPage
- No `RoleProtectedRoute` — any authenticated user can see the full patient directory
- Edit button disabled for non-admins via client-side `isAdmin` check (`SUPER_ADMIN` or `OWNER`)
- Page has full filter/search/pagination UI

#### 7. DoctorsPage
- Protected by `RoleProtectedRoute(['SUPER_ADMIN', 'OWNER'])`
- Uses DoctorCard grid + DoctorFormModal for create/edit + delete dialog
- SECRETARY role currently **cannot access** this page

#### 8. Data Available for KPIs
- `User` table: total users, count by role
- `Patient` table: total patients, active/inactive counts
- `Appointment` table: total appointments, by status, today's count
- **No stats/aggregation endpoint exists** on the backend

### Affected Areas

- `frontend/src/App.jsx` — add `/admin` route, update `/doctors` and `/patients` role guards
- `frontend/src/components/AppSidebar.jsx` — add conditional "Admin" menu item
- `frontend/src/pages/DashboardPage.jsx` — rename/reorganize; currently misnamed (user management)
- `frontend/src/services/userService.js` — add user create/update methods if needed
- `servicios/src/routes/v1/user.routes.ts` — add auth middleware to read routes; add role update support
- `servicios/src/routes/v1/index.ts` — add stats route
- `servicios/src/services/user.service.ts` — support role field in updates
- `servicios/src/controllers/user.controller.ts` — add role to update payload parsing
- **New**: `frontend/src/pages/AdminPage.jsx` — KPIs + full user CRUD
- **New**: `frontend/src/services/statsService.js` (or extend userService) — KPI data fetching
- **New**: `servicios/src/routes/v1/stats.routes.ts` — stats endpoint
- **New**: `servicios/src/controllers/stats.controller.ts` — stats controller
- **New**: `servicios/src/services/stats.service.ts` — stats aggregation logic

### Approaches

1. **Minimal: Add SECRETARY access + Admin sidebar item**
   - Add SECRETARY to DoctorsPage/PatientsPage route guards
   - Add conditional "Admin" item to sidebar using `user.role`
   - Keep DashboardPage as-is (user list)
   - Pros: Low effort, quick win
   - Cons: No KPIs, no user CRUD, DashboardPage still misnamed, no `/admin` route
   - Effort: Low

2. **Recommended: Full Admin Panel with KPIs + User CRUD**
   - Create new `/admin` route + AdminPage with KPI cards + full user CRUD (list, create, edit role/fields, delete)
   - Backend: add `GET /v1/stats` endpoint, add `role` update support, add auth to `GET /v1/users`
   - Sidebar: add conditional "Admin" item for SUPER_ADMIN, OWNER, SECRETARY
   - Update DoctorsPage/PatientsPage guards to include SECRETARY
   - Keep current DashboardPage as a personal summary page (or rename it)
   - Pros: Complete solution, proper separation of concerns, fixes security gaps
   - Cons: More work, need stats endpoint
   - Effort: Medium

3. **Aggressive: Restructure DashboardPage into AdminPage**
   - Move user management from DashboardPage to AdminPage
   - Transform DashboardPage into a true dashboard with personal info/summary
   - Pros: Clean separation, Dashboard is a dashboard again
   - Cons: Breaks existing URL structure, more refactoring
   - Effort: Medium-High

### Recommendation

**Approach 2: Full Admin Panel with KPIs + User CRUD**

Rationale:
- The change request explicitly asks for KPIs, user CRUD, role-conditional sidebar, and SECRETARY access — Approach 2 covers all requirements
- The existing DashboardPage can remain as a lightweight entry point for all authenticated users (or be simplified)
- Backend stats endpoint is a clean addition that can serve both AdminPage and future needs
- Fixing the `GET /v1/users` auth gap is a security win regardless of the admin panel
- Adding role update support to `userService.updateUser()` is a small backend change

Implementation order:
1. **Backend: Stats endpoint** — new route, controller, service for KPI aggregation
2. **Backend: Auth on GET /v1/users** — add `authenticateToken` to read routes
3. **Backend: Role update support** — modify `userService.updateUser()` to handle `role` field
4. **Frontend: AdminPage** — KPIs + full user CRUD table with create/edit modal
5. **Frontend: Sidebar + routes** — Add "Admin" item, `/admin` route with `RoleProtectedRoute`, update existing guards
6. **Cleanup** — audit existing DashboardPage

### Risks

- **Backend GET /v1/users read routes have no auth**: fixing this may break frontend components that call `getAll()` without authentication. All current callers (DashboardPage, PatientsPage doctor dropdown) are inside `ProtectedRoute` so cookies will be sent — should be safe.
- **Role update on users**: allowing admins to change roles could have unintended consequences (e.g., demoting the only SUPER_ADMIN). The backend should add safeguards: prevent self-demotion and prevent removing the last SUPER_ADMIN.
- **SECRETARY access expansion**: granting SECRETARY access to DoctorsPage means they can see doctor data and potentially create/edit doctors. Verify if SECRETARY should have write access or read-only.
- **SQLite stats queries**: aggregation queries (`groupBy`, `count`) work fine on SQLite but may need optimization if the dataset grows large. Currently not a concern.

### Ready for Proposal

Yes — the exploration reveals a clear gap and a well-scoped approach. The orchestrator can proceed to `sdd-propose` or `sdd-spec`.
