const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.inviteCoOwner = async (req, res, next) => {
  try {
    const { petId, inviteeId } = req.body;
    const inviterId = req.user.userId;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.ownerId !== inviterId) {
      return next(new AppError('Chỉ chủ sở hữu mới được gửi lời mời', 403, 'FORBIDDEN'));
    }

    const newInvite = await prisma.coOwnerInvitation.create({
      data: { petId, inviterId, inviteeId }
    });

    res.status(201).json({ message: "Đã gửi lời mời đồng sở hữu", invite: newInvite });
  } catch (error) {
    next(error);
  }
};

exports.respondToInvitation = async (req, res, next) => {
  try {
    const inviteId = parseInt(req.params.id);
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.user.userId;

    const invite = await prisma.coOwnerInvitation.findUnique({ where: { id: inviteId } });
    if (!invite || invite.inviteeId !== userId || invite.status !== 'PENDING') {
      return next(new AppError('Lời mời không hợp lệ hoặc đã được xử lý', 400, 'INVALID_INVITE'));
    }

    if (action === 'ACCEPT') {
      await prisma.coOwnerInvitation.update({ where: { id: inviteId }, data: { status: 'ACCEPTED' } });
      await prisma.pet.update({ where: { id: invite.petId }, data: { coOwnerId: userId } });
      res.status(200).json({ message: "Đã chấp nhận lời mời" });
    } else {
      await prisma.coOwnerInvitation.update({ where: { id: inviteId }, data: { status: 'REJECTED' } });
      res.status(200).json({ message: "Đã từ chối lời mời" });
    }
  } catch (error) {
    next(error);
  }
};

exports.requestDeletion = async (req, res, next) => {
  try {
    const petId = parseInt(req.params.petId);
    const coOwnerId = req.user.userId;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || pet.coOwnerId !== coOwnerId) {
      return next(new AppError('Chỉ Co-owner mới có thể tạo yêu cầu xóa', 403, 'FORBIDDEN'));
    }

    const newRequest = await prisma.petDeletionRequest.create({
      data: { petId, coOwnerId }
    });

    res.status(201).json({ message: "Đã gửi yêu cầu xóa tới Owner", request: newRequest });
  } catch (error) {
    next(error);
  }
};

exports.respondToDeletion = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const userId = req.user.userId;

    const request = await prisma.petDeletionRequest.findUnique({
      where: { id: requestId },
      include: { pet: true }
    });

    if (!request || request.pet.ownerId !== userId || request.status !== 'PENDING') {
      return next(new AppError('Yêu cầu không hợp lệ', 400, 'INVALID_REQUEST'));
    }

    if (action === 'APPROVE') {
      await prisma.petDeletionRequest.update({ where: { id: requestId }, data: { status: 'APPROVED' } });
      await prisma.pet.update({ where: { id: request.petId }, data: { deletedAt: new Date() } });
      res.status(200).json({ message: "Đã duyệt yêu cầu xóa" });
    } else {
      await prisma.petDeletionRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
      res.status(200).json({ message: "Đã từ chối yêu cầu xóa" });
    }
  } catch (error) {
    next(error);
  }
};

exports.escalateDeletion = async (req, res, next) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.userId;

    const request = await prisma.petDeletionRequest.findUnique({ where: { id: requestId } });
    
    if (!request || request.coOwnerId !== userId || request.status !== 'PENDING') {
      return next(new AppError('Yêu cầu không hợp lệ', 400, 'INVALID_REQUEST'));
    }

    const timeDiff = new Date() - new Date(request.requestedAt);
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff < 3) {
      return next(new AppError('Chưa đủ 3 ngày để chuyển cho AI Bot', 400, 'NOT_ENOUGH_TIME'));
    }

    await prisma.petDeletionRequest.update({ where: { id: requestId }, data: { status: 'ESCALATED' } });
    
    res.status(200).json({ message: "Yêu cầu đã được chuyển cho AI Bot xử lý thủ công" });
  } catch (error) {
    next(error);
  }
};
