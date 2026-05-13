const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();

exports.createPet = async (req, res, next) => {
  try {
    const { name, avatar, species, breed, age, healthStatus, requireTagApproval } = req.body;
    const ownerId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { pets: true }
    });

    if (user.accountType === 'PERSONAL' && user.pets.length >= user.petLimit) {
      return next(new AppError(`Bạn đã đạt giới hạn ${user.petLimit} thú cưng. Vui lòng nâng cấp hoặc dùng tính năng AI đếm thú cưng để tăng giới hạn.`, 403, 'PET_LIMIT_REACHED'));
    }

    const newPet = await prisma.pet.create({
      data: {
        name, avatar, species, breed, age, healthStatus, requireTagApproval, ownerId
      }
    });

    res.status(201).json({ message: "Tạo hồ sơ thú cưng thành công", pet: newPet });
  } catch (error) {
    next(error);
  }
};

exports.getPetById = async (req, res, next) => {
  try {
    const petId = parseInt(req.params.id);

    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        owner: { select: { id: true, displayName: true, avatar: true } },
        coOwner: { select: { id: true, displayName: true, avatar: true } }
      }
    });

    if (!pet) {
      return next(new AppError('Không tìm thấy thú cưng', 404, 'PET_NOT_FOUND'));
    }

    if (pet.isPermanentlyDeleted) {
      return res.status(200).json({
        message: "Hồ sơ thú cưng này đã được chủ nhân gỡ bỏ khỏi PetSaver",
        isDeleted: true
      });
    }

    res.status(200).json(pet);
  } catch (error) {
    next(error);
  }
};

exports.updatePet = async (req, res, next) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.user.userId;
    const updateData = req.body;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return next(new AppError('Không tìm thấy thú cưng', 404, 'PET_NOT_FOUND'));

    if (pet.ownerId !== userId) {
      return next(new AppError('Chỉ chủ sở hữu mới có quyền cập nhật thông tin chính', 403, 'FORBIDDEN'));
    }

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: updateData
    });

    res.status(200).json({ message: "Cập nhật thành công", pet: updatedPet });
  } catch (error) {
    next(error);
  }
};

exports.softDeletePet = async (req, res, next) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.user.userId;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return next(new AppError('Không tìm thấy thú cưng', 404, 'PET_NOT_FOUND'));

    if (pet.ownerId !== userId) {
      return next(new AppError('Chỉ chủ sở hữu mới có quyền xóa', 403, 'FORBIDDEN'));
    }

    await prisma.pet.update({
      where: { id: petId },
      data: { deletedAt: new Date() }
    });

    res.status(200).json({ message: "Đã xóa hồ sơ (đưa vào thùng rác)" });
  } catch (error) {
    next(error);
  }
};

exports.restorePet = async (req, res, next) => {
  try {
    const petId = parseInt(req.params.id);
    const userId = req.user.userId;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return next(new AppError('Không tìm thấy thú cưng', 404, 'PET_NOT_FOUND'));

    if (pet.ownerId !== userId) {
      return next(new AppError('Chỉ chủ sở hữu mới có quyền khôi phục', 403, 'FORBIDDEN'));
    }

    await prisma.pet.update({
      where: { id: petId },
      data: { deletedAt: null }
    });

    res.status(200).json({ message: "Khôi phục hồ sơ thành công" });
  } catch (error) {
    next(error);
  }
};

exports.transferOwnership = async (req, res, next) => {
  try {
    const petId = parseInt(req.params.id);
    const { newOwnerId } = req.body;
    const userId = req.user.userId;

    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) return next(new AppError('Không tìm thấy thú cưng', 404, 'PET_NOT_FOUND'));

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.accountType !== 'SHELTER' && pet.ownerId !== userId) {
        return next(new AppError('Chỉ Shelter hoặc Owner mới có quyền chuyển nhượng', 403, 'FORBIDDEN'));
    }

    await prisma.pet.update({
      where: { id: petId },
      data: {
        ownerId: newOwnerId,
        coOwnerId: null, // Reset co-owner on transfer
        shelterId: user.accountType === 'SHELTER' ? userId : pet.shelterId,
        isAdopted: user.accountType === 'SHELTER' ? true : pet.isAdopted
      }
    });

    res.status(200).json({ message: "Chuyển nhượng quyền sở hữu thành công" });
  } catch (error) {
    next(error);
  }
};
