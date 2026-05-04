const jwt = require('jsonwebtoken');

// Tạo một hàm middleware
const verifyToken = (req, res, next) => {
    // 1. Lấy mã token từ "túi" của khách (nằm trong phần header của request)
    const token = req.header('Authorization');

    // 2. Nếu không có token -> Đuổi ra ngoài
    if (!token) {
        return res.status(401).json({ message: "Từ chối truy cập! Vui lòng đăng nhập." });
    }

    try {
        // 3. Khách có token, nhưng thường nó có chữ "Bearer " ở đầu, ta phải cắt bỏ đi để lấy mã gốc
        const tokenWithoutBearer = token.split(" ")[1];

        // 4. Dùng thư viện jwt để soi xem thẻ này có phải thẻ giả hay hết hạn chưa
        const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        // 5. Thẻ thật! Gắn thông tin người dùng (userId) vào request để các bước sau (đăng bài) biết ai đang thao tác
        req.user = verified;

        // 6. Cho phép đi tiếp vào trong (gặp Controller)
        next();
    } catch (error) {
        res.status(400).json({ message: "Thẻ Token không hợp lệ hoặc đã hết hạn!" });
    }
};

module.exports = verifyToken;