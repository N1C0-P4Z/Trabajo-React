-- AlterTable
ALTER TABLE "User" ADD COLUMN "dni" TEXT;
ALTER TABLE "User" ADD COLUMN "direccion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");
