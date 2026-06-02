-- CreateTable
CREATE TABLE "Patient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "dni" TEXT NOT NULL,
    "obra_social" TEXT,
    "numero_afiliado" TEXT,
    "fecha_nacimiento" DATETIME,
    "direccion" TEXT,
    "telefono_alternativo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_user_id_key" ON "Patient"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_dni_key" ON "Patient"("dni");
