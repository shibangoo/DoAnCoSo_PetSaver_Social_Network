const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

const cleanupOldNotifications = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    await prisma.notification.deleteMany({
      where: { createdAt: { lt: sevenDaysAgo } }
    });
  } catch (error) {
    console.error("Lỗi dọn thông báo cũ:", error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    // Auto-cleanup before fetching
    await cleanupOldNotifications();

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    });
    res.status(200).json({ count });
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

exports.deleteNotification = async (req, res, next) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      return next(new AppError('Thông báo không tồn tại', 404, 'NOT_FOUND'));
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.status(200).json({ message: "Đã xóa thông báo" });
  } catch (error) {
    next(error);
  }
};
