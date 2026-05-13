const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Pagination can be added later
    });

    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      return next(new AppError('Thông báo không tồn tại', 404, 'NOT_FOUND'));
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.status(200).json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    next(error);
  }
};
