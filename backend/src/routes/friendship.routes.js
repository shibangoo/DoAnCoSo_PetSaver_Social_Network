const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendship.controller.js');
const verifyToken = require('../middlewares/auth.middleware.js');

router.post('/request', verifyToken, friendshipController.sendRequest);
router.post('/requests/:id/accept', verifyToken, friendshipController.acceptRequest);
router.delete('/requests/:id/reject', verifyToken, friendshipController.rejectRequest);
router.get('/', verifyToken, friendshipController.getFriends);
router.get('/:userId/list', verifyToken, friendshipController.getUserFriends);
router.get('/requests', verifyToken, friendshipController.getRequests);
router.delete('/:friendId/unfriend', verifyToken, friendshipController.unfriend);

module.exports = router;
