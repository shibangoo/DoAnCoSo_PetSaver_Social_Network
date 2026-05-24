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
const searchRoutes = require('./routes/search.routes');
const adminRoutes = require('./routes/admin.routes');
const messageRoutes = require('./routes/message.routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const startCronJobs = require('./utils/cronJobs');

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
app.use('/api/search', searchRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/messages', messageRoutes);

// Khởi động các tác vụ định kỳ
startCronJobs();

// Định nghĩa cổng để chạy server
const PORT = process.env.PORT || 3000;

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "*", // allow all frontend origins in dev
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Make io accessible in controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User joins their own room to receive private messages
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  const statusCode = err.statusCode || err.statuscode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Đã xảy ra lỗi hệ thống",
    errorCode: err.errorCode || "INTERNAL_ERROR"
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Mạng xã hội đang chạy tại: http://localhost:${PORT}`);
});

