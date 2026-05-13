const axios = require('axios');

async function runTests() {
  const baseURL = 'http://localhost:3000/api';
  console.log('--- BẮT ĐẦU TEST API ---');

  let email = `testuser_${Date.now()}@example.com`;
  let token = '';

  try {
    // 1. Đăng ký
    console.log(`\n[1] Thử đăng ký tài khoản mới (${email})...`);
    const registerRes = await axios.post(`${baseURL}/auth/register`, {
      email: email,
      password: 'testpassword123',
      displayName: 'Người Dùng Test'
    });
    console.log('✅ Kết quả Đăng ký:', registerRes.data);

    // 2. Đăng nhập
    console.log('\n[2] Thử đăng nhập để lấy Token...');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: email,
      password: 'testpassword123'
    });
    console.log('✅ Kết quả Đăng nhập:', { message: loginRes.data.message, token: loginRes.data.token.substring(0, 20) + '...' });
    token = loginRes.data.token;

    // 3. Đăng một bài viết mới (Cần Token)
    console.log('\n[3] Thử tạo một bài viết mới...');
    const postRes = await axios.post(`${baseURL}/posts/create`, {
      content: 'Chào mọi người! Đây là bài viết test từ hệ thống tự động.'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Kết quả Tạo bài viết:', postRes.data);

    // 4. Lấy danh sách bài viết
    console.log('\n[4] Thử lấy Feed (Danh sách bài viết)...');
    const getPostsRes = await axios.get(`${baseURL}/posts`);
    console.log(`✅ Kết quả Lấy danh sách: Tìm thấy ${getPostsRes.data.length} bài viết.`);
    
    // In ra bài viết đầu tiên để kiểm tra
    if (getPostsRes.data.length > 0) {
       console.log('📄 Bài viết mới nhất:', { id: getPostsRes.data[0].id, content: getPostsRes.data[0].content });
    }

    console.log('\n--- HOÀN TẤT TEST API ---');
  } catch (error) {
    console.log('\n❌ LỖI KHI TEST:');
    if (error.response) {
       console.log('Status:', error.response.status);
       console.log('Data:', error.response.data);
    } else {
       console.log(error.message);
    }
  }
}

runTests();
