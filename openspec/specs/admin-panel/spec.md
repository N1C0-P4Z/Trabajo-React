# panel-admin Specification

## Purpose

Provide a centralized administrative dashboard (`/admin`) where authorized roles (SUPER_ADMIN, OWNER, SECRETARY) can view business KPIs and perform secure user CRUD operations, while closing existing authentication gaps and establishing role-based access controls.

---

## Requirements

### Requirement 1: Admin Dashboard KPIs

The admin page MUST display 5 KPI cards with the following data:

| KPI | Source | Notes |
|-----|--------|-------|
| Total de pacientes | `stats.totalPatients` | Count from `Patient` table or `User.role='PATIENT'` |
| Total de doctores | `stats.totalDoctors` | Count from `User.role='DENTIST'` |
| Turnos del día (hoy) | `stats.todayAppointments` | Appointments where `date = today` |
| Turnos pendientes | `stats.pendingAppointments` | Appointments with status `pending` or `scheduled` |
| Ingresos del mes | Placeholder | Display `$0` or `"No disponible"` until payments module exists |

#### Scenario: KPIs display with valid data
- GIVEN an authenticated user with role `SUPER_ADMIN`
- WHEN they navigate to `/admin`
- THEN the page MUST display 5 KPI cards with numeric values for patients, doctors, today's appointments, and pending appointments

#### Scenario: Income KPI shows placeholder
- GIVEN any authorized user on `/admin`
- WHEN the KPI cards render
- THEN the "Ingresos del mes" card MUST display `$0` or `"No disponible"` (not a real query)

#### Scenario: KPIs handle empty database
- GIVEN a fresh database with no patients, doctors, or appointments
- WHEN an authorized user views `/admin`
- THEN all numeric KPIs MUST display `0` (not null, not error)

---

### Requirement 2: Admin User CRUD

From AdminPage, authorized roles (SUPER_ADMIN, OWNER, SECRETARY) MUST be able to:
- List all users with their roles visible
- Create new users with any role (SUPER_ADMIN, OWNER, DENTIST, SECRETARY, PATIENT)
- Edit users including changing their role
- Delete users with safety guards (see Requirement 6)

#### Scenario: List users with roles
- GIVEN an authenticated user with role `SUPER_ADMIN` or `OWNER` or `SECRETARY`
- WHEN they view the user management section of `/admin`
- THEN they MUST see a table listing all users with columns: username, email, role, and actions (edit, delete)

#### Scenario: Create user with role selection
- GIVEN an authorized admin on `/admin`
- WHEN they open the "Create User" form
- THEN the form MUST include a role dropdown with all 5 roles: SUPER_ADMIN, OWNER, DENTIST, SECRETARY, PATIENT
- WHEN they submit the form with valid data
- THEN the user MUST be created with the selected role

#### Scenario: Edit user including role change
- GIVEN an authorized admin on `/admin`
- WHEN they open the edit form for an existing user
- THEN the form MUST allow changing the user's role
- WHEN they save the changes
- THEN the user's role MUST be updated in the database

#### Scenario: Create user validation errors
- GIVEN an admin attempting to create a user with a duplicate username or email
- WHEN they submit the form
- THEN the system MUST display a validation error and NOT create the user

---

### Requirement 3: Backend Stats Endpoint

`GET /v1/stats` MUST return aggregated KPI data to authorized users only.

#### Scenario: Stats endpoint returns correct structure
- GIVEN an authenticated request to `GET /v1/stats`
- WHEN the endpoint is called
- THEN the response MUST be 200 with JSON containing: `totalPatients`, `totalDoctors`, `todayAppointments`, `pendingAppointments`

#### Scenario: Stats endpoint requires authentication
- GIVEN an unauthenticated request to `GET /v1/stats`
- WHEN the endpoint is called
- THEN the response MUST be 401

#### Scenario: Stats endpoint rejects unauthorized roles
- GIVEN an authenticated request with role `PATIENT` or `DENTIST`
- WHEN calling `GET /v1/stats`
- THEN the response MUST be 403

---

### Requirement 4: Backend User Auth Fix

`GET /v1/users` and `GET /v1/users/:id` MUST require authentication via `authenticateToken` middleware.

#### Scenario: GET /v1/users without auth returns 401
- GIVEN no authentication cookie
- WHEN calling `GET /v1/users`
- THEN the response MUST be 401

#### Scenario: GET /v1/users/:id without auth returns 401
- GIVEN no authentication cookie
- WHEN calling `GET /v1/users/1`
- THEN the response MUST be 401

#### Scenario: GET /v1/users with valid auth returns user list
- GIVEN a valid authentication cookie
- WHEN calling `GET /v1/users`
- THEN the response MUST be 200 with the list of users

---

### Requirement 5: Backend User Update — Role Field

`PUT /v1/users/:id` MUST accept and persist the `role` field in the request body.

#### Scenario: Update user role successfully
- GIVEN an authenticated admin with role `SUPER_ADMIN` or `OWNER`
- WHEN calling `PUT /v1/users/:id` with body `{ "role": "DENTIST", ... }`
- THEN the user's role MUST be updated in the database
- AND the response MUST include the updated user with the new role

#### Scenario: Update user with invalid role is rejected
- GIVEN a request with body `{ "role": "INVALID_ROLE" }`
- WHEN calling `PUT /v1/users/:id`
- THEN the response MUST be 400

---

### Requirement 6: Backend User Delete Guards

The delete endpoint MUST reject:
- Self-deletion (user cannot delete their own account)
- Deletion of the last SUPER_ADMIN (system must always have at least one)

#### Scenario: Self-deletion is rejected
- GIVEN an authenticated user with ID `X`
- WHEN they call `DELETE /v1/users/X`
- THEN the response MUST be 403 with a message indicating self-deletion is not allowed
- AND the user MUST NOT be deleted

#### Scenario: Last SUPER_ADMIN deletion is rejected
- GIVEN only one user exists with role `SUPER_ADMIN`
- WHEN an admin calls `DELETE /v1/users/{lastSuperAdminId}`
- THEN the response MUST be 403 with a message indicating the last SUPER_ADMIN cannot be deleted
- AND the user MUST NOT be deleted

#### Scenario: Delete non-last SUPER_ADMIN is allowed
- GIVEN at least two users with role `SUPER_ADMIN`
- WHEN an admin calls `DELETE /v1/users/{superAdminId}` (not the last one)
- THEN the response MUST be 200
- AND the user MUST be deleted

---

### Requirement 7: SECRETARY Permissions

SECRETARY role MUST have the following permissions:
- **Pacientes**: read, edit — NO delete. Patient creation happens via user registration (SUPER_ADMIN/OWNER only).
- **Doctores**: read only — NO create, edit, or delete

#### Scenario: SECRETARY can read and edit patients
- GIVEN an authenticated user with role `SECRETARY`
- WHEN they access `/patients`
- THEN they MUST see the patient list
- AND they MUST be able to edit existing patients

#### Scenario: SECRETARY cannot delete patients
- GIVEN an authenticated user with role `SECRETARY`
- WHEN they view a patient record
- THEN the delete button MUST NOT be visible
- AND calling `DELETE /v1/patients/:id` MUST return 403

#### Scenario: SECRETARY can read doctors
- GIVEN an authenticated user with role `SECRETARY`
- WHEN they access `/doctors`
- THEN they MUST see the doctor list

#### Scenario: SECRETARY cannot modify doctors
- GIVEN an authenticated user with role `SECRETARY`
- WHEN they view a doctor record
- THEN create/edit/delete buttons MUST NOT be visible
- AND calling `POST/PUT/DELETE /v1/doctors/*` MUST return 403

---

### Requirement 8: Admin Sidebar Item

The sidebar MUST show an "Admin" menu item ONLY for roles: SUPER_ADMIN, OWNER, SECRETARY.

#### Scenario: Admin item visible for SUPER_ADMIN
- GIVEN an authenticated user with role `SUPER_ADMIN`
- WHEN the sidebar renders
- THEN the "Admin" menu item MUST be visible

#### Scenario: Admin item visible for OWNER
- GIVEN an authenticated user with role `OWNER`
- WHEN the sidebar renders
- THEN the "Admin" menu item MUST be visible

#### Scenario: Admin item visible for SECRETARY
- GIVEN an authenticated user with role `SECRETARY`
- WHEN the sidebar renders
- THEN the "Admin" menu item MUST be visible

#### Scenario: Admin item hidden for DENTIST
- GIVEN an authenticated user with role `DENTIST`
- WHEN the sidebar renders
- THEN the "Admin" menu item MUST NOT be visible

#### Scenario: Admin item hidden for PATIENT
- GIVEN an authenticated user with role `PATIENT`
- WHEN the sidebar renders
- THEN the "Admin" menu item MUST NOT be visible

---

### Requirement 9: Admin Route Guard

The `/admin` route MUST be protected by `RoleProtectedRoute` allowing only SUPER_ADMIN, OWNER, and SECRETARY.

#### Scenario: Authorized role accesses /admin
- GIVEN an authenticated user with role `SUPER_ADMIN`, `OWNER`, or `SECRETARY`
- WHEN they navigate to `/admin`
- THEN the AdminPage MUST render successfully

#### Scenario: Unauthorized role is blocked from /admin
- GIVEN an authenticated user with role `DENTIST` or `PATIENT`
- WHEN they navigate to `/admin`
- THEN they MUST be redirected away (or shown an access denied page)
- AND the AdminPage MUST NOT render

#### Scenario: Unauthenticated user is blocked from /admin
- GIVEN no active session
- WHEN navigating to `/admin`
- THEN the user MUST be redirected to the login page

---

## Dependencies

| Dependency | Type | Description |
|------------|------|-------------|
| Prisma `User` model | Existing | Source of truth for users and roles |
| Prisma `Patient` model | Existing | For counting total patients |
| Prisma `Appointment` model | Existing | For counting today's and pending appointments |
| `authenticateToken` middleware | Existing | Must be applied to stats and user read routes |
| `RoleProtectedRoute` component | Existing | Must guard `/admin` route |
| `requireRole` middleware | Existing | For backend role checks on stats endpoint |
| `useAuth()` hook | Existing | For frontend role-based sidebar visibility |

## Acceptance Criteria

- [ ] `GET /v1/stats` returns `{ totalPatients, totalDoctors, todayAppointments, pendingAppointments }` for authorized users
- [ ] `GET /v1/stats` returns 401 without auth, 403 for PATIENT/DENTIST roles
- [ ] `GET /v1/users` and `GET /v1/users/:id` return 401 without authentication cookie
- [ ] `PUT /v1/users/:id` accepts and persists the `role` field
- [ ] `DELETE /v1/users/:id` returns 403 for self-deletion attempts
- [ ] `DELETE /v1/users/:id` returns 403 when attempting to delete the last SUPER_ADMIN
- [ ] AdminPage displays 5 KPI cards: patients, doctors, today's appointments, pending appointments, income placeholder
- [ ] AdminPage user table shows username, email, role, and action buttons
- [ ] AdminPage create form includes role dropdown with all 5 roles
- [ ] AdminPage edit form allows role changes
- [ ] Sidebar "Admin" item visible for SUPER_ADMIN, OWNER, SECRETARY only
- [ ] `/admin` route guarded by `RoleProtectedRoute(['SUPER_ADMIN', 'OWNER', 'SECRETARY'])`
- [ ] SECRETARY can access `/patients` with edit but no delete (create via SUPER_ADMIN/OWNER user registration)
- [ ] SECRETARY can access `/doctors` in read-only mode (no create/edit/delete)
- [ ] All numeric KPIs display `0` on empty database (no nulls or errors)
