-- CreateTable
CREATE TABLE "AppointmentType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "suggested_duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "datetime" DATETIME NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "type_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "notes" TEXT,
    "obra_social" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "AppointmentType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentType_name_key" ON "AppointmentType"("name");
