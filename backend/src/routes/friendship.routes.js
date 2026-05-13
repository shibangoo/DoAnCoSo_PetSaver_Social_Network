const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendship.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.post('/request', verifyToken, friendshipController.sendRequest);
router.post('/requests/:id/accept', verifyToken, friendshipController.acceptRequest);
router.get('/', verifyToken, friendshipController.getFriends);

module.exports = router;
