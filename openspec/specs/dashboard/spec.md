# Delta for dashboard

## ADDED Requirements

### Requirement: PATIENT dashboard redirect

When a PATIENT user navigates to `/dashboard`, the system MUST redirect them to `/appointments`. The `/dashboard` route SHALL NOT render the default dashboard content for PATIENT role.

#### Scenario: PATIENT redirected from dashboard
- GIVEN an authenticated PATIENT user
- WHEN they navigate to `/dashboard`
- THEN they MUST be redirected to `/appointments`

#### Scenario: Non-PATIENT accesses dashboard normally
- GIVEN an authenticated user with role DENTIST, SUPER_ADMIN, OWNER, or SECRETARY
- WHEN they navigate to `/dashboard`
- THEN the dashboard page MUST render without redirect

### Requirement: DENTIST dashboard content

The dashboard for DENTIST users MUST NOT display the full user list. Instead, it SHALL show role-relevant content such as today's schedule or upcoming appointments.

#### Scenario: DENTIST does not see user list
- GIVEN an authenticated DENTIST user
- WHEN they view `/dashboard`
- THEN the page MUST NOT display a list of all users

#### Scenario: Staff roles retain user list on dashboard
- GIVEN an authenticated SUPER_ADMIN, OWNER, or SECRETARY
- WHEN they view `/dashboard`
- THEN the page MUST display the user list as before (existing behavior preserved)
