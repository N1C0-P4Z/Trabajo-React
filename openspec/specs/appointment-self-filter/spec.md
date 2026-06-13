# appointment-self-filter Specification

## Purpose

Provide backend endpoints for role-scoped appointment retrieval. PATIENT and DENTIST users retrieve only their own appointments via `/me` endpoint or query-param filters. Staff roles (SUPER_ADMIN, OWNER, SECRETARY) retain unrestricted access.

## Requirements

### Requirement: Self-scoped appointments endpoint

`GET /v1/appointments/me` MUST return appointments filtered by the authenticated user's linked entity: PATIENT by `patient_id`, DENTIST by `doctor_id`. The endpoint MUST resolve the user's entity ID from the JWT payload (`req.user`).

#### Scenario: PATIENT retrieves own appointments
- GIVEN an authenticated PATIENT with `patient_id=5`
- WHEN calling `GET /v1/appointments/me`
- THEN the response MUST be 200 with only appointments where `patient_id=5`

#### Scenario: DENTIST retrieves own appointments
- GIVEN an authenticated DENTIST with `doctor_id=3`
- WHEN calling `GET /v1/appointments/me`
- THEN the response MUST be 200 with only appointments where `doctor_id=3`

#### Scenario: Staff role retrieves all appointments via /me
- GIVEN an authenticated SUPER_ADMIN, OWNER, or SECRETARY
- WHEN calling `GET /v1/appointments/me`
- THEN the response MUST be 200 with all appointments (no filter applied)

#### Scenario: Unauthenticated request to /me
- GIVEN no authentication cookie
- WHEN calling `GET /v1/appointments/me`
- THEN the response MUST be 401

### Requirement: Query-param filtering on appointments list

`GET /v1/appointments` MUST accept optional `patient_id` and `doctor_id` query parameters. When provided, the results MUST be filtered accordingly. Parameters are optional and backward-compatible — omitting them returns all appointments for authorized roles.

#### Scenario: Filter by patient_id
- GIVEN an authenticated user
- WHEN calling `GET /v1/appointments?patient_id=5`
- THEN the response MUST be 200 with only appointments where `patient_id=5`

#### Scenario: Filter by doctor_id
- GIVEN an authenticated user
- WHEN calling `GET /v1/appointments?doctor_id=3`
- THEN the response MUST be 200 with only appointments where `doctor_id=3`

#### Scenario: No filter returns all appointments
- GIVEN an authenticated SUPER_ADMIN
- WHEN calling `GET /v1/appointments` (no query params)
- THEN the response MUST be 200 with all appointments

#### Scenario: Invalid patient_id is rejected
- GIVEN an authenticated user
- WHEN calling `GET /v1/appointments?patient_id=abc`
- THEN the response MUST be 400
