const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.respondToPostTag = async (req, res, next) => {
  try {
    const { postId, petId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'
    const userId = req.user.userId;

    const pet = await prisma.pet.findUnique({ where: { id: parseInt(petId) } });
    if (!pet || pet.ownerId !== userId) {
      return next(new AppError('Chỉ chủ sở hữu mới có quyền duyệt Tag', 403, 'FORBIDDEN'));
    }

    const postTag = await prisma.postTag.findUnique({
      where: {
        postId_petId: { postId: parseInt(postId), petId: parseInt(petId) }
      }
    });

    if (!postTag || postTag.status !== 'PENDING') {
      return next(new AppError('Tag không hợp lệ hoặc đã được xử lý', 400, 'INVALID_TAG'));
    }

    if (action === 'APPROVE') {
      await prisma.postTag.update({
        where: { id: postTag.id },
        data: { status: 'APPROVED' }
      });
      res.status(200).json({ message: "Đã duyệt Tag thành công" });
    } else {
      await prisma.postTag.delete({ where: { id: postTag.id } });
      res.status(200).json({ message: "Đã từ chối Tag" });
    }
  } catch (error) {
    next(error);
  }
};

exports.blockUserTagging = async (req, res, next) => {
  try {
    const blockerId = req.user.userId;
    const { blockedId } = req.body;

    if (blockerId === blockedId) {
      return next(new AppError('Không thể tự block chính mình', 400, 'INVALID_BLOCK'));
    }

    const newBlock = await prisma.tagBlock.create({
      data: { blockerId, blockedId }
    });

    res.status(201).json({ message: "Đã thêm người dùng vào danh sách chặn Tag", block: newBlock });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return next(new AppError('Người dùng này đã bị chặn', 400, 'ALREADY_BLOCKED'));
    }
    next(error);
  }
};

exports.unblockUserTagging = async (req, res, next) => {
  try {
    const blockerId = req.user.userId;
    const { blockedId } = req.body;

    await prisma.tagBlock.deleteMany({
      where: { blockerId, blockedId }
    });

    res.status(200).json({ message: "Đã gỡ chặn Tag" });
  } catch (error) {
    next(error);
  }
};
