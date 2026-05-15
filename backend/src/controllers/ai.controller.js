const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError.js');
const prisma = new PrismaClient();
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo SDK Gemini. Sử dụng chuỗi rỗng nếu chưa có key để không lỗi server khi khởi động.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// Hàm hỗ trợ chuyển đổi ArrayBuffer sang định dạng cho GoogleGenerativeAI
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(buffer).toString("base64"),
      mimeType
    },
  };
}

exports.analyzePetCount = async (req, res, next) => {
  try {
    const { mediaUrl } = req.body; // URL of the image
    const userId = req.user.userId;

    if (!mediaUrl) {
      return next(new AppError('Vui lòng cung cấp URL hình ảnh đàn thú cưng', 400, 'MISSING_MEDIA'));
    }

    if (!process.env.GEMINI_API_KEY) {
      return next(new AppError('Hệ thống chưa được cấu hình AI Key', 500, 'MISSING_API_KEY'));
    }

    console.log(`[AI Vision] Đang tải ảnh từ: ${mediaUrl}`);

    // Download image từ URL
    const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
    const mimeType = response.headers['content-type'] || 'image/jpeg';

    if (!mimeType.startsWith('image/')) {
      return next(new AppError('Hiện tại tính năng đếm thú cưng AI chỉ hỗ trợ định dạng hình ảnh.', 400, 'INVALID_FORMAT'));
    }

    const imagePart = fileToGenerativePart(response.data, mimeType);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = "Hãy đếm tổng số lượng chó và mèo có trong bức ảnh này. Chỉ trả về một con số duy nhất, không giải thích gì thêm, không thêm bất kỳ chữ nào khác.";

    console.log(`[AI Vision] Đang gửi ảnh lên Gemini API để phân tích...`);
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();

    const detectedPetCount = parseInt(responseText, 10);

    if (isNaN(detectedPetCount)) {
      return next(new AppError(`AI không thể nhận diện được số lượng rõ ràng. Kết quả AI trả về: ${responseText}`, 400, 'AI_PARSE_ERROR'));
    }

    if (detectedPetCount > 5) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const newLimit = Math.max(user.petLimit, detectedPetCount);

      if (newLimit > user.petLimit) {
        await prisma.user.update({
          where: { id: userId },
          data: { petLimit: newLimit }
        });
      }

      return res.status(200).json({
        message: `AI phát hiện ${detectedPetCount} thú cưng. Giới hạn nuôi của bạn đã được nâng lên ${newLimit}!`,
        newLimit
      });
    }

    res.status(200).json({
      message: `AI phát hiện ${detectedPetCount} thú cưng. Số lượng chưa vượt giới hạn hiện tại của bạn.`,
      detectedPetCount
    });

  } catch (error) {
    if (error.response && error.response.status) {
      console.error('[AI Vision] Lỗi tải ảnh:', error.message);
      return next(new AppError('Không thể tải ảnh từ URL cung cấp', 400, 'IMAGE_DOWNLOAD_FAILED'));
    }
    console.error('[AI Vision Error]:', error);
    next(new AppError('Có lỗi xảy ra khi phân tích ảnh', 500, 'AI_VISION_ERROR'));
  }
};

exports.chatWithBot = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return next(new AppError('Vui lòng cung cấp nội dung tin nhắn', 400, 'MISSING_MESSAGE'));
    }

    if (!process.env.GEMINI_API_KEY) {
      return next(new AppError('Hệ thống chưa được cấu hình AI Key', 500, 'MISSING_API_KEY'));
    }

    console.log(`[AI Chatbot] Người dùng hỏi: ${message}`);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: "Bạn là PetSaver Bot, một trợ lý thông minh của mạng xã hội thú cưng PetSaver. Nhiệm vụ của bạn là tư vấn chăm sóc thú cưng (chó, mèo), hỗ trợ người dùng tìm thú lạc, và luôn trả lời thân thiện, hữu ích, ngắn gọn, súc tích bằng tiếng Việt."
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.status(200).json({ reply });
  } catch (error) {
    console.error('[AI Chatbot Error]:', error);
    next(new AppError('Có lỗi xảy ra khi kết nối với AI Bot', 500, 'AI_CHAT_ERROR'));
  }
};
