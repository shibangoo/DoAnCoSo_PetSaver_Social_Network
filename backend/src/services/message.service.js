const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrGetConversation = async (userId, targetUserId) => {
  // Check if conversation already exists between these two users
  const existingConversations = await prisma.conversationParticipant.findMany({
    where: {
      userId: {
        in: [userId, targetUserId]
      }
    },
    select: { conversationId: true }
  });

  // Find the intersection
  const counts = {};
  for (let c of existingConversations) {
    counts[c.conversationId] = (counts[c.conversationId] || 0) + 1;
  }
  
  let conversationId = Object.keys(counts).find(id => counts[id] === 2);

  if (conversationId) {
    return prisma.conversation.findUnique({
      where: { id: parseInt(conversationId) },
      include: {
        participants: {
          include: { user: { select: { id: true, displayName: true, avatar: true } } }
        }
      }
    });
  }

  // Determine initial status based on friendship
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { user1Id: userId, user2Id: targetUserId, status: "ACCEPTED" },
        { user1Id: targetUserId, user2Id: userId, status: "ACCEPTED" }
      ]
    }
  });

  const status = friendship ? "ACCEPTED" : "PENDING";

  // Create new conversation
  const newConversation = await prisma.conversation.create({
    data: {
      status,
      participants: {
        create: [
          { userId },
          { userId: targetUserId }
        ]
      }
    },
    include: {
      participants: {
        include: { user: { select: { id: true, displayName: true, avatar: true } } }
      }
    }
  });

  return newConversation;
};

const sendMessage = async (senderId, conversationId, content, image, isEmergency = false) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'desc' }, take: 10 } } // for anti-spam check
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Find recipient
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId: { not: senderId } }
  });
  
  if (!participant) {
    throw new Error('Invalid conversation participants');
  }

  const recipientId = participant.userId;

  if (conversation.status === "PENDING") {
    // 2.2 Anti-Spam or 2.3 Emergency Override
    if (isEmergency) {
      // Emergency: allows 10 consecutive messages if no reply
      // Count consecutive messages by this sender
      let senderConsecutiveCount = 0;
      for (const msg of conversation.messages) {
        if (msg.senderId === senderId) senderConsecutiveCount++;
        else break;
      }
      
      if (senderConsecutiveCount >= 10) {
        const error = new Error('You can only send 10 emergency messages while waiting for a reply.');
        error.status = 403;
        throw error;
      }
      
      // Emergency bypasses PENDING, we don't block based on 1 message, but it still stays PENDING or we just allow it.
      // Requirements say: "Tin nhắn này không bị đưa vào mục "Tin nhắn chờ". Phải được đưa thẳng vào Inbox chính để người nhận thấy ngay."
      // It implies emergency messages show up immediately. We don't change conversation status to ACCEPTED here, but UI handles it.
    } else {
      // Normal message in PENDING: Max 3 messages
      const sentMessagesCount = await prisma.message.count({
        where: {
          conversationId,
          senderId,
        }
      });

      if (sentMessagesCount >= 3) {
         const error = new Error('Bạn đã nhắn hết ba tin nhắn, chờ hoặc kết bạn để được trò chuyện');
         error.status = 403;
         throw error;
      }
    }
  }

  // If status is PENDING and this is a reply from the recipient (the one who didn't send the first message)
  // Auto-accept
  if (conversation.status === "PENDING") {
    const firstMessage = await prisma.message.findFirst({
       where: { conversationId },
       orderBy: { createdAt: 'asc' }
    });
    if (firstMessage && firstMessage.senderId !== senderId) {
       await prisma.conversation.update({
         where: { id: conversationId },
         data: { status: "ACCEPTED" }
       });
    }
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      image,
      isEmergency
    },
    include: {
      sender: { select: { id: true, displayName: true, avatar: true } }
    }
  });

  return { message, recipientId };
};

const getMessages = async (conversationId, cursor, limit = 30) => {
  const query = {
    where: { conversationId: parseInt(conversationId) },
    take: limit,
    orderBy: { id: 'desc' },
    include: {
      sender: { select: { id: true, displayName: true, avatar: true } }
    }
  };

  if (cursor) {
    query.cursor = { id: parseInt(cursor) };
    query.skip = 1; // skip the cursor itself
  }

  const messages = await prisma.message.findMany(query);
  return messages.reverse(); // Return in chronological order
};

const getConversations = async (userId) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, displayName: true, avatar: true } }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return conversations;
};

const acceptConversation = async (conversationId, userId) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: parseInt(conversationId) },
    include: { participants: true }
  });

  if (!conversation) throw new Error('Conversation not found');
  if (conversation.status !== "PENDING") throw new Error('Conversation is already accepted');

  const isParticipant = conversation.participants.some(p => p.userId === userId);
  if (!isParticipant) throw new Error('Unauthorized');

  const updatedConversation = await prisma.conversation.update({
    where: { id: parseInt(conversationId) },
    data: { status: "ACCEPTED" }
  });

  return updatedConversation;
};

const getUnreadCount = async (userId) => {
  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderId: { not: userId },
      conversation: {
        participants: {
          some: { userId }
        }
      }
    }
  });
  return count;
};

const markConversationAsRead = async (conversationId, userId) => {
  await prisma.message.updateMany({
    where: {
      conversationId: parseInt(conversationId),
      isRead: false,
      senderId: { not: userId }
    },
    data: {
      isRead: true
    }
  });
  return true;
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
