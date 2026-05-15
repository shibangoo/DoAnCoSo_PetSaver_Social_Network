const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.sendRequest = async (req, res, next) => {
  try {
    const user1Id = req.user.userId;
    const user2Id = parseInt(req.body.user2Id);

    if (isNaN(user2Id)) {
      return next(new AppError('ID người dùng không hợp lệ', 400, 'INVALID_USER_ID'));
    }

    if (user1Id === user2Id) {
      return next(new AppError('Không thể tự kết bạn với chính mình', 400, 'INVALID_FRIEND_REQUEST'));
    }

    const newRequest = await prisma.friendship.create({
      data: { user1Id, user2Id }
    });

    const sender = await prisma.user.findUnique({ where: { id: user1Id } });

    await prisma.notification.create({
      data: {
        userId: user2Id,
        type: 'FRIEND_REQUEST',
        message: `${sender.displayName || 'Ai đó'} đã gửi cho bạn một lời mời kết bạn.`,
        referenceId: sender.id
      }
    });

    res.status(201).json({ message: "Đã gửi lời mời kết bạn", request: newRequest });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new AppError('Đã có lời mời kết bạn hoặc đã là bạn bè', 400, 'ALREADY_FRIENDS'));
    }
    next(error);
  }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.userId;

    const request = await prisma.friendship.findUnique({ where: { id: requestId } });
    
    // In our schema, user2Id is the invitee
    if (!request || request.user2Id !== userId || request.status !== 'PENDING') {
      return next(new AppError('Lời mời không hợp lệ', 400, 'INVALID_REQUEST'));
    }

    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    res.status(200).json({ message: "Đã chấp nhận kết bạn" });
  } catch (error) {
    next(error);
  }
};

exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const friendsAsUser1 = await prisma.friendship.findMany({
      where: { user1Id: userId, status: 'ACCEPTED' },
      include: { user2: { select: { id: true, displayName: true, avatar: true } } }
    });

    const friendsAsUser2 = await prisma.friendship.findMany({
      where: { user2Id: userId, status: 'ACCEPTED' },
      include: { user1: { select: { id: true, displayName: true, avatar: true } } }
    });

    const friendsList = [
      ...friendsAsUser1.map(f => f.user2),
      ...friendsAsUser2.map(f => f.user1)
    ];

    res.status(200).json({ friends: friendsList });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.userId;

    const request = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request || (request.user2Id !== userId && request.user1Id !== userId)) {
      return next(new AppError('Lời mời không hợp lệ', 400, 'INVALID_REQUEST'));
    }

    await prisma.friendship.delete({ where: { id: requestId } });
    res.status(200).json({ message: "Đã hủy/từ chối lời mời kết bạn" });
  } catch (error) {
    next(error);
  }
};

exports.unfriend = async (req, res, next) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const userId = req.user.userId;

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId }
        ],
        status: 'ACCEPTED'
      }
    });

    if (!friendship) {
      return next(new AppError('Không tìm thấy bạn bè', 404, 'NOT_FRIENDS'));
    }

    await prisma.friendship.delete({ where: { id: friendship.id } });
    res.status(200).json({ message: "Đã hủy kết bạn" });
  } catch (error) {
    next(error);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const requests = await prisma.friendship.findMany({
      where: { user2Id: userId, status: 'PENDING' },
      include: { user1: { select: { id: true, displayName: true, avatar: true } } }
    });

    const formatted = requests.map(r => ({ id: r.id, user: r.user1 }));

    res.status(200).json({ requests: formatted });
  } catch (error) {
    next(error);
  }
};
