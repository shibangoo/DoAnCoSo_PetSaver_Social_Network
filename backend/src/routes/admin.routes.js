const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/admin.middleware');

router.use(verifyToken);

// Chỉ SUPER_ADMIN mới được tạo ADMIN mới
router.post('/create-admin', restrictTo('SUPER_ADMIN'), adminController.createAdmin);

// ADMIN và SUPER_ADMIN đều có quyền truy cập dashboard và reports
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReport);
router.delete('/reports/:id/post', adminController.deleteReportedPost);

// Các thao tác dưới đây chỉ dành cho SUPER_ADMIN
router.use(restrictTo('SUPER_ADMIN'));

router.patch('/users/:id/ban', adminController.banUser);
router.patch('/users/:id/unban', adminController.unbanUser);

router.patch('/users/:id/promote', adminController.promoteToAdmin);
router.patch('/users/:id/demote', adminController.demoteFromAdmin);

router.get('/users', adminController.getUsers);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
