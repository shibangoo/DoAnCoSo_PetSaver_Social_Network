const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const startCronJobs = () => {
  // Chạy vào 2h sáng mỗi ngày: 0 2 * * *
  cron.schedule('0 2 * * *', async () => {
    console.log('Bắt đầu tiến trình xóa tài khoản bị khóa trên 30 ngày...');
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const usersToDelete = await prisma.user.findMany({
        where: {
          status: 'BANNED',
          bannedAt: {
            lt: thirtyDaysAgo
          }
        },
        select: { id: true }
      });

      if (usersToDelete.length === 0) {
        console.log('Không có tài khoản nào cần xóa.');
        return;
      }

      console.log(`Tìm thấy ${usersToDelete.length} tài khoản cần xóa. Đang xử lý theo chunk...`);

      const chunkSize = 10;
      for (let i = 0; i < usersToDelete.length; i += chunkSize) {
        const chunk = usersToDelete.slice(i, i + chunkSize);
        const chunkIds = chunk.map(u => u.id);

        // Prisma automatically handles cascading deletes if onDelete: Cascade is configured.
        // Otherwise, you would manually delete related records here.
        // As PetSaver schema has onDelete: Cascade for user relations (most of them), we can delete User.
        await prisma.user.deleteMany({
          where: { id: { in: chunkIds } }
        });

        console.log(`Đã xóa xong chunk ${Math.floor(i / chunkSize) + 1}`);
      }

      console.log('Hoàn thành tiến trình xóa tài khoản.');
    } catch (error) {
      console.error('Lỗi khi chạy cron job xóa tài khoản:', error);
    }
  });
};

module.exports = startCronJobs;
