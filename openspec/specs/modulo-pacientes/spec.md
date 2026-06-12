# modulo-pacientes Specification

## Purpose
Manage **patient profiles** (administrative data) as a 1:1 extension of `User`, providing API + UI for listing, viewing, updating and deactivating patients.

## Requirements

### Requirement: Patient profile invariants
The system MUST persist a `Patient` profile linked 1:1 to a `User` with `role=PATIENT`, enforce uniqueness of `user_id` and `dni`, and expose `is_active` for status filtering.

#### Scenario: Enforce 1:1 link and unique DNI
- GIVEN an existing `Patient` profile for `user_id=X`
- WHEN the system attempts to create another `Patient` for the same `user_id=X` OR a duplicated `dni`
- THEN the operation MUST fail

### Requirement: Auto-create patient profile on registration
When a `User` is created with `role=PATIENT`, the system MUST also create exactly one linked `Patient` profile.

#### Scenario: Register patient user auto-creates profile
- GIVEN a valid user registration request with `role=PATIENT`
- WHEN the user is created successfully
- THEN a linked `Patient` profile MUST exist for that `user_id`

### Requirement: Backfill legacy patient users
The system MUST provide a seed/backfill routine that creates missing `Patient` profiles for existing `PATIENT` users and MUST be idempotent.

#### Scenario: Backfill is idempotent
- GIVEN two existing `PATIENT` users, one with a `Patient` profile and one without
- WHEN the backfill routine runs twice
- THEN each `PATIENT` user MUST have exactly one `Patient` profile

### Requirement: Authorization for patients API
The system MUST require authentication for all `/v1/patients` endpoints. Update operations MUST be restricted to `SUPER_ADMIN`, `OWNER`, and `SECRETARY` roles. Delete operations MUST be restricted to `SUPER_ADMIN` and `OWNER` roles.

#### Scenario: Non-admin cannot update
- GIVEN an authenticated user with role `DENTIST`
- WHEN they call `PUT /v1/patients/:id`
- THEN the response MUST be 403

#### Scenario: SECRETARY can update patients
- GIVEN an authenticated user with role `SECRETARY`
- WHEN they call `PUT /v1/patients/:id` with valid data
- THEN the response MUST be 200 and the patient MUST be updated

### Requirement: List patients with search, filters and pagination
`GET /v1/patients` MUST support `search`, `obra_social`, `doctor_id`, `desde`, `hasta`, `estado`, `pagina`, `limite` and return stable pagination.

#### Scenario: Search + filter returns only matching active patients
- GIVEN multiple patients with different `obra_social` and `dni`
- WHEN calling `GET /v1/patients?search={dniPart}&obra_social={os}&estado=active&pagina=1&limite=10`
- THEN only matching patients MUST be returned

### Requirement: Patient detail includes computed appointment fields
`GET /v1/patients/:id` MUST return patient profile data plus computed fields `last_visit_at` and `next_visit_at` derived from `Appointment` (nullable if not available).

#### Scenario: Computed visit fields are nullable
- GIVEN a patient with no appointments
- WHEN calling `GET /v1/patients/:id`
- THEN `last_visit_at` MUST be null AND `next_visit_at` MUST be null

### Requirement: Update patient profile
`PUT /v1/patients/:id` MUST allow admins to update patient fields (`dni`, `obra_social`, `numero_afiliado`, `fecha_nacimiento`, `direccion`, `telefono_alternativo`, `is_active`) and MUST reject invalid IDs.

#### Scenario: Invalid patient ID
- GIVEN a request to `PUT /v1/patients/abc`
- WHEN the endpoint is called
- THEN the response MUST be 400

### Requirement: Delete patient deactivates profile
`DELETE /v1/patients/:id` MUST deactivate the patient profile by setting `is_active=false` and MUST be idempotent.

#### Scenario: Delete is idempotent
- GIVEN an existing active patient profile
- WHEN calling `DELETE /v1/patients/:id` twice
- THEN the patient MUST remain deactivated (`is_active=false`)
