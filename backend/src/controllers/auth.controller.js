const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError.js')

const prisma = new PrismaClient();

//Sign up
exports.register = async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return next(new AppError('Thieu thong tin dang ki', 400, 'MISSING_FIELDS'));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email da ton tai trong he thong', 409, 'EMAIL_ALREADY_EXISTS'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName
      }
    });

    res.status(201).json({
      message: "Dang ky thanh cong",
      userId: newUser.id
    });

  } catch (error) {
    next(error);
  }
};

//sign-in
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //1 tim user bang email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("-> DỪNG: Không tìm thấy tài khoản!");
      return next(new AppError('Tai khoan khong ton tai', 404, 'USER_NOT_FOUND'));
    }

    //2 so sanh mat khau
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(new AppError('Sai mai khau', 401, 'INVALID_PASSWORD'));
    }

    // Reactivate account if it was deactivated
    if (user.isDeactivated) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isDeactivated: false }
      });
    }

    //4 Tao JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Tra ve ca thong tin user de luu vao localStorage
    const userInfo = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role
    };
    
    res.status(200).json({ message: "Dang nhap thanh cong", token, user: userInfo });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return next(new AppError('Email khong ton tai', 404, 'USER_NOT_FOUND'));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    res.status(200).json({ message: "Doi mat khau thanh cong" });
  } catch (error) {
    next(error);
  }
}

exports.getAllUsers = async (req, res, next) => {
  try {
    //lay users nhung giau mk
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, displayName: true }
    });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { avatar, coverImage, displayName, dob, bio } = req.body;
    const userId = req.user.userId; // Requires auth middleware

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(avatar !== undefined && { avatar }),
        ...(coverImage !== undefined && { coverImage }),
        ...(displayName !== undefined && { displayName }),
        ...(dob !== undefined && { dob: new Date(dob) }),
        ...(bio !== undefined && { bio })
      },
      select: { id: true, email: true, displayName: true, avatar: true, coverImage: true, dob: true, bio: true }
    });

    res.status(200).json({ message: "Cập nhật hồ sơ thành công", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        coverImage: true,
        dob: true,
        bio: true,
        role: true,
        accountType: true,
        pets: {
          where: { isPermanentlyDeleted: false },
          orderBy: { createdAt: 'desc' }
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: { id: true, displayName: true, avatar: true }
            },
            tags: {
              include: {
                pet: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            },
            reactions: true,
            _count: {
              select: { comments: true }
            },
            sharedPost: {
              include: {
                author: { select: { id: true, displayName: true, avatar: true } }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return next(new AppError('Tài khoản không tồn tại', 404, 'USER_NOT_FOUND'));
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return next(new AppError('ID người dùng không hợp lệ', 400, 'INVALID_USER_ID'));
    }

    const blocks = await prisma.tagBlock.findMany({
      where: {
        OR: [
          { blockerId: req.user.userId, blockedId: userId },
          { blockerId: userId, blockedId: req.user.userId }
        ]
      }
    });

    if (blocks.length > 0) {
      return next(new AppError('Người dùng không khả dụng', 404, 'USER_NOT_FOUND'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatar: true,
        coverImage: true,
        bio: true,
        isDeactivated: true,
        pets: {
          where: { isPermanentlyDeleted: false },
          orderBy: { createdAt: 'desc' }
        },
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: { select: { id: true, displayName: true, avatar: true } },
            reactions: true,
            _count: { select: { comments: true } },
            sharedPost: {
              include: {
                author: { select: { id: true, displayName: true, avatar: true } }
              }
            }
          }
        }
      }
    });

    if (!user || user.isDeactivated) {
      return next(new AppError('Tài khoản không tồn tại hoặc đã bị khóa tạm thời', 404, 'USER_NOT_FOUND'));
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: req.user.userId, user2Id: userId },
          { user1Id: userId, user2Id: req.user.userId }
        ]
      }
    });

    let friendshipState = 'NONE';
    let requestId = null;

    if (friendship) {
      if (friendship.status === 'ACCEPTED') {
        friendshipState = 'FRIENDS';
      } else if (friendship.status === 'PENDING') {
        requestId = friendship.id;
        if (friendship.user1Id === req.user.userId) {
          friendshipState = 'SENT_REQUEST';
        } else {
          friendshipState = 'RECEIVED_REQUEST';
        }
      }
    }

    res.status(200).json({ ...user, isFriend: friendshipState === 'FRIENDS', friendshipState, requestId });
  } catch (error) {
    next(error);
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const existingFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      }
    });

    const excludedIds = existingFriendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    excludedIds.push(userId);

    const users = await prisma.user.findMany({
      where: { id: { notIn: excludedIds } },
      take: 20,
      select: { id: true, displayName: true, avatar: true, email: true }
    });
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) return res.status(401).json({ message: "Mật khẩu cũ không đúng" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};

exports.getBlockedUsers = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const blocks = await prisma.tagBlock.findMany({
      where: { blockerId: userId },
      include: {
        blocked: { select: { id: true, displayName: true, avatar: true } }
      }
    });
    res.status(200).json(blocks.map(b => b.blocked));
  } catch (error) {
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const blockedId = parseInt(req.params.id);

    await prisma.tagBlock.deleteMany({
      where: { blockerId: userId, blockedId: blockedId }
    });

    res.status(200).json({ message: "Đã bỏ chặn người dùng" });
  } catch (error) {
    next(error);
  }
};

exports.deactivateAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    await prisma.user.update({
      where: { id: userId },
      data: { isDeactivated: true }
    });

    res.status(200).json({ message: "Tài khoản đã được khóa tạm thời" });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(401).json({ message: "Mật khẩu không đúng" });

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ message: "Tài khoản đã bị xóa vĩnh viễn" });
  } catch (error) {
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const blockedId = parseInt(req.params.id);

    // Unfriend if friends
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { user1Id: userId, user2Id: blockedId },
          { user1Id: blockedId, user2Id: userId }
        ]
      }
    });

    // Block
    const existing = await prisma.tagBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: userId, blockedId: blockedId } }
    });

    if (!existing) {
      await prisma.tagBlock.create({
        data: { blockerId: userId, blockedId: blockedId }
      });
    }

    res.status(200).json({ message: "Đã chặn người dùng" });
  } catch (error) {
    next(error);
  }
};
