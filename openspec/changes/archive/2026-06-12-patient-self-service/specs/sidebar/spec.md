# Delta for sidebar

## ADDED Requirements

### Requirement: PATIENT sidebar menu items

The sidebar for PATIENT users MUST display only the following menu items: "Agenda" and "Mi Perfil". All other sidebar items (Dashboard, Admin, Users, Patients, Doctors) MUST be hidden.

#### Scenario: PATIENT sees only Agenda and Mi Perfil
- GIVEN an authenticated PATIENT user
- WHEN the sidebar renders
- THEN only "Agenda" and "Mi Perfil" items MUST be visible

#### Scenario: PATIENT does not see admin or management items
- GIVEN an authenticated PATIENT user
- WHEN the sidebar renders
- THEN "Dashboard", "Admin", "Users", "Patients", and "Doctors" items MUST NOT be visible

#### Scenario: Non-PATIENT sidebar unchanged
- GIVEN an authenticated user with role other than PATIENT
- WHEN the sidebar renders
- THEN the sidebar items MUST render according to existing role-based rules (no change to current behavior)

### Requirement: Mi Perfil placeholder

The "Mi Perfil" sidebar item for PATIENT users MUST navigate to a placeholder page or section. This is a reserved item for future patient profile editing functionality.

#### Scenario: Mi Perfil navigates to placeholder
- GIVEN an authenticated PATIENT user
- WHEN they click "Mi Perfil" in the sidebar
- THEN they MUST be navigated to a profile placeholder page (not a 404)
