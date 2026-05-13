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

    //4 Tao JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: "Dang nhap thanh cong", token });
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
    const { avatar, coverImage, displayName, dob } = req.body;
    const userId = req.user.userId; // Requires auth middleware

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(avatar !== undefined && { avatar }),
        ...(coverImage !== undefined && { coverImage }),
        ...(displayName !== undefined && { displayName }),
        ...(dob !== undefined && { dob: new Date(dob) })
      },
      select: { id: true, email: true, displayName: true, avatar: true, coverImage: true, dob: true }
    });

    res.status(200).json({ message: "Cập nhật hồ sơ thành công", user: updatedUser });
  } catch (error) {
    next(error);
  }
};
