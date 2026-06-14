const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const PACIENTES = [
  { first_name: 'Lucía', last_name: 'Giménez', email: 'lucia.gimenez@email.com' },
  { first_name: 'Martín', last_name: 'Rodríguez', email: 'martin.rodriguez@email.com' },
  { first_name: 'Sofía', last_name: 'López', email: 'sofia.lopez@email.com' },
  { first_name: 'Facundo', last_name: 'Martínez', email: 'facundo.martinez@email.com' },
  { first_name: 'Camila', last_name: 'Fernández', email: 'camila.fernandez@email.com' },
  { first_name: 'Joaquín', last_name: 'González', email: 'joaquin.gonzalez@email.com' },
  { first_name: 'Valentina', last_name: 'Pérez', email: 'valentina.perez@email.com' },
  { first_name: 'Tomás', last_name: 'Díaz', email: 'tomas.diaz@email.com' },
  { first_name: 'Isabella', last_name: 'Torres', email: 'isabella.torres@email.com' },
  { first_name: 'Benjamín', last_name: 'Sánchez', email: 'benjamin.sanchez@email.com' },
  { first_name: 'Julieta', last_name: 'Romero', email: 'julieta.romero@email.com' },
  { first_name: 'Mateo', last_name: 'Álvarez', email: 'mateo.alvarez@email.com' },
  { first_name: 'Emilia', last_name: 'Castillo', email: 'emilia.castillo@email.com' },
  { first_name: 'Santino', last_name: 'Flores', email: 'santino.flores@email.com' },
  { first_name: 'Catalina', last_name: 'Acosta', email: 'catalina.acosta@email.com' },
];

async function main() {
  const hash = await bcrypt.hash('paciente123', 10);

  let creados = 0;
  let omitidos = 0;

  for (const p of PACIENTES) {
    const username = `${p.first_name.toLowerCase()}.${p.last_name.toLowerCase()}`;
    const email = p.email;

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      console.log(`  ⏭️  ${p.first_name} ${p.last_name} — ya existe`);
      omitidos++;
      continue;
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        first_name: p.first_name,
        last_name: p.last_name,
        phone: `+54 9 11 ${String(1000 + creados).padStart(4, '0')}-${String(1000 + creados).padStart(4, '0')}`,
        password_hash: hash,
        role: 'PATIENT',
      }
    });

    await prisma.patient.create({
      data: {
        user_id: user.id,
        dni: `${30000000 + creados}`,
      }
    });

    console.log(`  ✅ ${p.first_name} ${p.last_name} — DNI: ${30000000 + creados}`);
    creados++;
  }

  console.log(`\n📊 Resumen: ${creados} creados, ${omitidos} omitidos`);
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
