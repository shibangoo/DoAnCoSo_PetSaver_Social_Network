const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minute)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 1 phút."
  }
});

const tagLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // Limit each IP to 5 tags per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Bạn thao tác quá nhanh, vui lòng chờ một chút trước khi tag tiếp."
  }
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 3, // AI is heavy, limit to 3 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Hệ thống AI đang quá tải với yêu cầu của bạn, vui lòng thử lại sau."
  }
});

module.exports = {
  apiLimiter,
  tagLimiter,
  aiLimiter
};
