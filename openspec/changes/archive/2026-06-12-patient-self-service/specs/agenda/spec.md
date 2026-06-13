# Delta for agenda

## ADDED Requirements

### Requirement: PATIENT agenda auto-filter

The agenda page for PATIENT users MUST automatically filter appointments to show only those belonging to the logged-in patient. The filter MUST use the patient's `patient_id` from the auth context.

#### Scenario: PATIENT sees only own appointments
- GIVEN an authenticated PATIENT with `patient_id=5` and 3 appointments in the system (2 for patient 5, 1 for patient 7)
- WHEN they view the agenda page
- THEN only the 2 appointments for patient 5 MUST be displayed

#### Scenario: PATIENT with no appointments sees empty state
- GIVEN an authenticated PATIENT with no appointments
- WHEN they view the agenda page
- THEN an empty state message MUST be displayed (not an error)

### Requirement: PATIENT agenda hides creation controls

The "Nuevo turno" (new appointment) button MUST NOT be visible to PATIENT users on the agenda page. Patient self-booking is out of scope for this change.

#### Scenario: Nuevo turno hidden for PATIENT
- GIVEN an authenticated PATIENT user
- WHEN they view the agenda page
- THEN the "Nuevo turno" button MUST NOT be visible

#### Scenario: Nuevo turno visible for non-PATIENT
- GIVEN an authenticated user with role other than PATIENT
- WHEN they view the agenda page
- THEN the "Nuevo turno" button visibility MUST follow existing role-based rules (unchanged)

### Requirement: DENTIST agenda pre-filter

The agenda page for DENTIST users MUST pre-select the logged-in doctor in the doctor filter dropdown. The agenda SHOULD initially show only the logged-in doctor's appointments, but the user MAY change the filter to view other doctors' appointments.

#### Scenario: DENTIST agenda pre-selects self
- GIVEN an authenticated DENTIST with `doctor_id=3`
- WHEN they view the agenda page
- THEN the doctor filter dropdown MUST pre-select doctor 3
- AND the initial view MUST show only appointments for doctor 3

#### Scenario: DENTIST can change doctor filter
- GIVEN an authenticated DENTIST viewing their pre-filtered agenda
- WHEN they change the doctor filter to another doctor
- THEN the agenda MUST update to show the selected doctor's appointments
