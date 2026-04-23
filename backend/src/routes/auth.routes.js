const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

const verifyToken = require('../middlewares/auth.middleware.js');
const isAdmin = require('../middlewares/admin.middleware.js');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/reset-password', authController.resetPassword);

//duong dan xem dc cua admin
router.get('/all-users', verifyToken, isAdmin, authController.getAllUsers);

module.exports = router;