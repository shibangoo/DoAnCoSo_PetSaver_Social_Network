const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.get('/', verifyToken, notificationController.getNotifications);
router.post('/:id/read', verifyToken, notificationController.markAsRead);

module.exports = router;
