# Design: Admin Panel with KPIs and User Management

## Technical Approach

Follow the existing 4-layer backend pattern (routes→controller→service→repository) and frontend patterns (shadcn Dialog + react-hook-form + zod). The change is additive: new stats module, new AdminPage, extended user routes, and conditional sidebar. All existing functionality remains intact.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|---|---|---|---|
| Stats module | A) New `stats` module (route, controller, service) | Clean separation, follows 4-layer, easy to extend | **A** |
| | B) Extend user controller | Violates single responsibility, harder to maintain | |
| User CRUD modal | A) Reuse `PatientFormModal` pattern with new `UserFormModal` | Consistent Dialog+Form+Zod pattern, role dropdown, create/edit dual mode | **A** |
| | B) Inline forms in AdminPage | Simpler but less reusable, harder to maintain | |
| Role update guards | A) Backend-only guards (self-demotion, last-SUPER_ADMIN) | Centralized, cannot be bypassed | **A** |
| | B) Frontend + backend | Redundant; backend is the source of truth | |
| SECRETARY permissions | A) Extend `requireRole` to accept SECRETARY on specific routes | Minimal change, clear per-route intent | **A** |
| | B) New `requirePermission` middleware | Overkill for current scope; can add later if needed | |
| User read auth fix | A) Add `authenticateToken` to GET routes | Closes security gap, cookies still work for current callers | **A** |
| | B) Keep open | Unacceptable security risk | |
| Sidebar admin item | A) Conditionally inject into `menuItems` array based on `user.role` | Keeps existing iteration, minimal change | **A** |
| | B) Separate conditional render | More verbose, no benefit | |

## Data Flow

```
AdminPage.jsx
  ├─→ statsService.getStats() ──→ GET /v1/stats ──→ stats.controller ──→ stats.service ──→ Prisma
  │                                      ↑
  │                                      └─ authenticateToken + requireRole(...)
  ├─→ userService.getAll() ──→ GET /v1/users ──→ user.controller ──→ user.service ──→ userRepository
  │                              ↑
  │                              └─ authenticateToken (NEW)
  ├─→ userService.register() ──→ POST /v1/users
  ├─→ userService.updateUser() ──→ PUT /v1/users/:id
  └─→ userService.deleteUser() ──→ DELETE /v1/users/:id

AppSidebar.jsx
  └─→ useAuth().user.role ──→ conditionally render "Admin" menu item

App.jsx
  └─→ RoleProtectedRoute(['SUPER_ADMIN','OWNER','SECRETARY']) ──→ /admin
  └─→ RoleProtectedRoute(['SUPER_ADMIN','OWNER','SECRETARY']) ──→ /patients (expanded)
  └─→ RoleProtectedRoute(['SUPER_ADMIN','OWNER','SECRETARY']) ──→ /doctors (expanded)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `servicios/src/routes/v1/stats.routes.ts` | Create | `GET /v1/stats` with `authenticateToken` + `requireRole` |
| `servicios/src/controllers/stats.controller.ts` | Create | Calls `statsService.getDashboardStats()` |
| `servicios/src/services/stats.service.ts` | Create | Prisma aggregations for patients, doctors, appointments |
| `servicios/src/routes/v1/index.ts` | Modify | Register `stats` router under `/stats` |
| `servicios/src/routes/v1/user.routes.ts` | Modify | Add `authenticateToken` to `GET /` and `GET /:id` |
| `servicios/src/services/user.service.ts` | Modify | Add `role` to `updateUser` validation; add self-demotion + last-SUPER_ADMIN guards in `deleteUser` |
| `servicios/src/routes/v1/patient.routes.ts` | Modify | Add `SECRETARY` to `PUT /:id` (create/edit) route guard |
| `frontend/src/pages/AdminPage.jsx` | Create | KPI cards + user table + `UserFormModal` trigger |
| `frontend/src/components/UserFormModal.jsx` | Create | Dialog with form: username, email, names, phone, password, role dropdown (all 5 roles) |
| `frontend/src/services/statsService.js` | Create | `getStats()` fetch wrapper |
| `frontend/src/services/userService.js` | Modify | Add `updateUser(id, data)` and `createUser(data)` (general) if missing |
| `frontend/src/App.jsx` | Modify | Add `/admin` route with `RoleProtectedRoute`; expand `/doctors` and `/patients` allowed roles |
| `frontend/src/components/AppSidebar.jsx` | Modify | Conditionally add "Admin" item for `SUPER_ADMIN`, `OWNER`, `SECRETARY` |
| `frontend/src/pages/PatientsPage.jsx` | Modify | Allow `SECRETARY` to create/edit; hide delete for `SECRETARY` |
| `frontend/src/pages/DoctorsPage.jsx` | Modify | Hide create/edit/delete buttons for `SECRETARY`; read-only mode |

## Interfaces / Contracts

### Stats Response
```typescript
interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  pendingAppointments: number;
}
```

### UserFormModal Props
```typescript
interface UserFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
  user?: User | null; // null = create mode
}
```

### Backend Role Guard Update
```typescript
// patient.routes.ts — SECRETARY added to write routes
router.put('/:id', requireRole('SUPER_ADMIN', 'OWNER', 'SECRETARY'), patientController.update);
// Delete remains SUPER_ADMIN + OWNER only
```

### User Service Guards (pseudo)
```typescript
// In deleteUser:
if (userId === requestingUser.userId) throw new Error('Self-deletion not allowed');
if (user.role === 'SUPER_ADMIN') {
  const superAdminCount = await userRepository.countByRole('SUPER_ADMIN');
  if (superAdminCount <= 1) throw new Error('Cannot delete the last SUPER_ADMIN');
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `stats.service` aggregation queries | Manual verification via curl + seeded data |
| Integration | `GET /v1/stats` returns correct shape | Smoke test with authenticated request |
| Integration | `DELETE /v1/users/:id` guards | Attempt self-delete and last-admin delete; verify 403 |
| E2E | Admin page renders KPIs and user table | Manual navigation check |
| E2E | SECRETARY sees read-only doctors | Log in as SECRETARY, verify buttons hidden |

## Migration / Rollout

No migration required. The change is purely additive except for the auth fix on `GET /v1/users`, which is a security hardening. All existing callers are within `ProtectedRoute` and already send cookies.

## Open Questions

- None — all decisions are resolvable with existing patterns.
