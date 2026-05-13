const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();
const axios = require('axios'); // Requires axios, I will add it to instructions or use fetch

exports.analyzePetCount = async (req, res, next) => {
  try {
    const { mediaUrl } = req.body; // URL of the image/video
    const userId = req.user.userId;

    if (!mediaUrl) {
      return next(new AppError('Vui lòng cung cấp URL hình ảnh/video đàn thú cưng', 400, 'MISSING_MEDIA'));
    }

    // Proxy call to AI Vision model (Mock implementation)
    // Replace this with actual axios.post to your AI URL
    console.log(`[AI Proxy] Gửi ảnh tới AI Vision để đếm: ${mediaUrl}`);

    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock result: AI detected 8 pets
    const detectedPetCount = 8;

    if (detectedPetCount > 5) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const newLimit = Math.max(user.petLimit, detectedPetCount);

      await prisma.user.update({
        where: { id: userId },
        data: { petLimit: newLimit }
      });

      return res.status(200).json({
        message: `AI phát hiện ${detectedPetCount} thú cưng. Giới hạn nuôi của bạn đã được nâng lên ${newLimit}!`,
        newLimit
      });
    }

    res.status(200).json({
      message: `AI chỉ phát hiện ${detectedPetCount} thú cưng. Giới hạn chưa thay đổi.`,
      detectedPetCount
    });

  } catch (error) {
    next(error);
  }
};

exports.chatWithBot = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Mock implementation for AI Chatbot
    console.log(`[AI Chatbot] Người dùng hỏi: ${message}`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const reply = `Xin chào! Tôi là PetSaver Bot. Bạn hỏi về: "${message}". Tôi có thể giúp bạn chăm sóc thú cưng hoặc hỗ trợ tìm thú lạc!`;

    res.status(200).json({ reply });
  } catch (error) {
    next(error);
  }
};
