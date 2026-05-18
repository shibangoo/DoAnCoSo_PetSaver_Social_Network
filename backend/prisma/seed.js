const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const superAdminEmail = 'superadmin@petsaver.com';
  
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail }
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        displayName: 'Super Admin',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('Đã tạo tài khoản SUPER_ADMIN mặc định. (Email: superadmin@petsaver.com, Password: superadmin123)');
  } else {
    console.log('Tài khoản SUPER_ADMIN đã tồn tại.');
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
