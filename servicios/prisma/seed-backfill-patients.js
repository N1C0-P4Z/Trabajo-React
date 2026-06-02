const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando usuarios con rol PATIENT...');

  // Encontrar todos los usuarios con rol PATIENT
  const patientUsers = await prisma.user.findMany({
    where: { role: 'PATIENT' },
    select: { id: true, first_name: true, last_name: true }
  });

  console.log(`  ${patientUsers.length} usuarios PATIENT encontrados`);

  let creados = 0;
  let omitidos = 0;

  for (const user of patientUsers) {
    // Verificar si ya existe un Patient para este user_id
    const existingPatient = await prisma.patient.findUnique({
      where: { user_id: user.id }
    });

    if (existingPatient) {
      console.log(`  ⏭️  ${user.first_name} ${user.last_name} (ID ${user.id}) — ya tiene PatientProfile`);
      omitidos++;
      continue;
    }

    // Crear Patient profile con DNI pendiente
    // Usamos un fallback único basado en el user_id para evitar conflictos de unicidad
    await prisma.patient.create({
      data: {
        user_id: user.id,
        dni: `BACKFILL-${user.id}`
      }
    });

    console.log(`  ✅ ${user.first_name} ${user.last_name} (ID ${user.id}) — PatientProfile creado (DNI: BACKFILL-${user.id})`);
    creados++;
  }

  console.log(`\n📊 Resumen: ${creados} creados, ${omitidos} ya existían`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
