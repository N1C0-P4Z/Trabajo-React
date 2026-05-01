const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!existingUser) {
    const hash = bcrypt.hashSync('secret123', 10);
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
    console.log('Default user created: admin / secret123');
  } else {
    console.log('Default user already exists');
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
