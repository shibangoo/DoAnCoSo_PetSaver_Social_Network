const express = require('express');
require('dotenv').config(); // Đọc các biến bảo mật từ file .env

const app = express();
const cors = require('cors');
app.use(cors()); //cho phep fe goi fe thoai mai

// Middleware tích hợp sẵn của Express giúp ứng dụng hiểu được dữ liệu JSON gửi lên từ Frontend
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Nhập các Lễ tân (Routes) đã tạo
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const petRoutes = require('./routes/pet.routes');
const coOwnershipRoutes = require('./routes/co-ownership.routes');
const taggingRoutes = require('./routes/tagging.routes');
const aiRoutes = require('./routes/ai.routes');
const friendshipRoutes = require('./routes/friendship.routes');
const notificationRoutes = require('./routes/notification.routes');
const { apiLimiter } = require('./middlewares/rateLimiter');

// Đăng ký luồng đi: 
app.use('/api', apiLimiter); // Apply general rate limiter to all API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/co-ownership', coOwnershipRoutes);
app.use('/api/tagging', taggingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/friends', friendshipRoutes);
app.use('/api/notifications', notificationRoutes);

// Định nghĩa cổng để chạy server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Mạng xã hội đang chạy tại: http://localhost:${PORT}`);
});

