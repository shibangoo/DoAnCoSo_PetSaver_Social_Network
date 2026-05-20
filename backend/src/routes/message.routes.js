const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const verifyToken = require('../middlewares/auth.middleware');

// All message routes require authentication
router.use(verifyToken);

// Create or get conversation
router.post('/conversations', messageController.createOrGetConversation);

// Get list of conversations for the user
router.get('/conversations', messageController.getConversations);

// Get unread messages count
router.get('/unread-count', messageController.getUnreadCount);

// Get messages for a conversation
router.get('/:conversationId', messageController.getMessages);

// Send a message
router.post('/:conversationId', messageController.sendMessage);

// Accept a pending conversation
router.put('/:conversationId/accept', messageController.acceptConversation);

// Mark conversation as read
router.put('/:conversationId/read', messageController.markConversationAsRead);

module.exports = router;
