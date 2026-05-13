const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.sendRequest = async (req, res, next) => {
  try {
    const user1Id = req.user.userId;
    const { user2Id } = req.body;

    if (user1Id === user2Id) {
      return next(new AppError('Không thể tự kết bạn với chính mình', 400, 'INVALID_FRIEND_REQUEST'));
    }

    const newRequest = await prisma.friendship.create({
      data: { user1Id, user2Id }
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
