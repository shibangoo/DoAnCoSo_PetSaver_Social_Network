const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.get('/', verifyToken, notificationController.getNotifications);
router.get('/unread-count', verifyToken, notificationController.getUnreadCount);
router.post('/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;
