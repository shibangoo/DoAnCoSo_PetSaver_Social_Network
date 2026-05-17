const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

const verifyToken = require('../middlewares/auth.middleware.js');
const { restrictTo } = require('../middlewares/admin.middleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/reset-password', authController.resetPassword);

//duong dan xem dc cua admin
router.get('/all-users', verifyToken, restrictTo('ADMIN', 'SUPER_ADMIN'), authController.getAllUsers);

// update profile
router.put('/update-profile', verifyToken, authController.updateProfile);

// Get my profile including pets and posts
router.get('/me', verifyToken, authController.getMe);

// Get suggestions
router.get('/suggestions', verifyToken, authController.getSuggestions);

// Get other user profile
router.get('/profile/:id', verifyToken, authController.getUserProfile);

// Change Password
router.put('/change-password', verifyToken, authController.changePassword);

// Block/Unblock
router.get('/blocked-users', verifyToken, authController.getBlockedUsers);
router.post('/block/:id', verifyToken, authController.blockUser);
router.post('/unblock/:id', verifyToken, authController.unblockUser);

// Deactivate/Delete
router.post('/deactivate', verifyToken, authController.deactivateAccount);
router.post('/delete-account', verifyToken, authController.deleteAccount);

module.exports = router;