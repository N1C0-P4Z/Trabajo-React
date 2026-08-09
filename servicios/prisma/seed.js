const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword) {
  console.error('[SEED] ADMIN_PASSWORD environment variable is required. Aborting.');
  process.exit(1);
}

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!existingUser) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@clinica.com',
        first_name: 'Administrador',
        last_name: 'Sistema',
        phone: '+54 9 11 1234-5678',
        password_hash: hash,
        role: 'SUPER_ADMIN'
      }
    });
    console.log('Default user created: admin (password from ADMIN_PASSWORD env)');
  } else {
    console.log('Default user already exists');
  }

  // Tipos de turno
  const tipos = [
    {
      name: 'Consulta General',
      description: 'Revisión general y diagnóstico',
      suggested_duration_minutes: 30,
      color: '#3B82F6'
    },
    {
      name: 'Limpieza',
      description: 'Limpieza dental completa',
      suggested_duration_minutes: 45,
      color: '#10B981'
    }
  ];

  const tiposCreados = [];
  for (const tipo of tipos) {
    const exists = await prisma.appointmentType.findUnique({ where: { name: tipo.name } });
    if (!exists) {
      const created = await prisma.appointmentType.create({ data: tipo });
      tiposCreados.push(created);
      console.log(`  AppointmentType created: ${tipo.name}`);
    } else {
      tiposCreados.push(exists);
      console.log(`  AppointmentType already exists: ${tipo.name}`);
    }
  }

  // Turno de ejemplo (próximo día hábil a las 10:00)
  const consulta = tiposCreados.find(t => t.name === 'Consulta General');
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });

  if (consulta && adminUser) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(10, 0, 0, 0);

    // Salt weekends (skip to Monday if tomorrow is Saturday or Sunday)
    const dia = manana.getDay();
    if (dia === 6) manana.setDate(manana.getDate() + 2);      // Saturday → Monday
    else if (dia === 0) manana.setDate(manana.getDate() + 1);  // Sunday → Monday

    const existeTurno = await prisma.appointment.findFirst({
      where: { datetime: manana, patient_id: adminUser.id }
    });

    if (!existeTurno) {
      await prisma.appointment.create({
        data: {
          patient_id: adminUser.id,
          doctor_id: adminUser.id,
          datetime: manana,
          duration_minutes: consulta.suggested_duration_minutes,
          type_id: consulta.id,
          status: 'PENDIENTE',
          notes: 'Turno de demo — creado por seed'
        }
      });
      console.log(`  Sample appointment created for ${manana.toISOString()}`);
    } else {
      console.log('  Sample appointment already exists');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
