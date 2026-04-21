const express = require('express');
require('dotenv').config(); // Đọc các biến bảo mật từ file .env

const app = express();

// Middleware tích hợp sẵn của Express giúp ứng dụng hiểu được dữ liệu JSON gửi lên từ Frontend
app.use(express.json());

// Nhập các Lễ tân (Routes) đã tạo
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');

// Đăng ký luồng đi: 
// Ví dụ ai vào đường dẫn '/api/auth/register' thì sẽ được đẩy qua authRoutes xử lý
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Định nghĩa cổng để chạy server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Mạng xã hội đang chạy tại: http://localhost:${PORT}`);
});