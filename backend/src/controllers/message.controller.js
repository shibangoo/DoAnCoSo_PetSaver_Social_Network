const messageService = require('../services/message.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrGetConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    if (userId === parseInt(targetUserId)) {
        return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    const conversation = await messageService.createOrGetConversation(userId, parseInt(targetUserId));
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { conversationId } = req.params;
    const { content, image, isEmergency } = req.body;

    const { message, recipientId } = await messageService.sendMessage(
      senderId, 
      parseInt(conversationId), 
      content, 
      image, 
      isEmergency
    );

    // If socket.io is initialized, we can emit event here
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('new_message', message);
    }

    // Create or update grouped notification for the recipient
    if (content || image) {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: parseInt(conversationId),
          senderId: senderId,
          isRead: false
        }
      });
      
      const existingNotif = await prisma.notification.findFirst({
        where: { 
          userId: recipientId, 
          type: 'NEW_MESSAGE', 
          referenceId: message.conversationId 
        }
      });
      
      const senderName = message.sender?.displayName || 'một người dùng';
      const notifMsg = unreadCount > 1 
        ? `Bạn có ${unreadCount} tin nhắn mới từ ${senderName}` 
        : `Bạn có tin nhắn mới từ ${senderName}`;
      
      if (existingNotif) {
        await prisma.notification.update({
          where: { id: existingNotif.id },
          data: {
            message: notifMsg,
            isRead: false,
            createdAt: new Date()
          }
        });
      } else {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'NEW_MESSAGE',
            message: notifMsg,
            referenceId: message.conversationId,
          }
        });
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    if (error.status === 403) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to send message' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { cursor, limit } = req.query;
    
    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId: parseInt(conversationId), userId: req.user.userId }
    });
    
    if (!participant) {
        return res.status(403).json({ error: 'Not part of this conversation' });
    }

    const messages = await messageService.getMessages(conversationId, cursor, limit ? parseInt(limit) : 30);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const conversations = await messageService.getConversations(userId);
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

const acceptConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    const conversation = await messageService.acceptConversation(conversationId, userId);
    res.status(200).json(conversation);
  } catch (error) {
    console.error('Error accepting conversation:', error);
    if (error.message === 'Conversation not found') return res.status(404).json({ error: error.message });
    if (error.message === 'Unauthorized') return res.status(403).json({ error: error.message });
    res.status(500).json({ error: 'Failed to accept conversation' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await messageService.getUnreadCount(userId);
    res.status(200).json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    await messageService.markConversationAsRead(conversationId, userId);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

module.exports = {
  createOrGetConversation,
  sendMessage,
  getMessages,
  getConversations,
  acceptConversation,
  getUnreadCount,
  markConversationAsRead
};
