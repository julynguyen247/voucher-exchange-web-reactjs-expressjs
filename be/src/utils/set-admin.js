/**
 * Script để thiết lập quyền ADMIN cho người dùng
 * Usage: node set-admin.js <email>
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Import User model
const User = require('../models/user');

async function setAdmin(email) {
  console.log(`Thiết lập quyền ADMIN cho: ${email}`);

  let connection = null;
  
  try {
    // Lấy URL kết nối từ biến môi trường hoặc sử dụng URL mặc định
    const uri = process.env.MONGO_DB_URL || 
                process.env.MONGODB_URI || 
                'mongodb://localhost:27017/mydatabase';
    
    console.log(`Kết nối đến database: ${uri}`);
    
    // Kết nối đến MongoDB
    await mongoose.connect(uri);
    connection = mongoose.connection;
    
    console.log('Đã kết nối đến database.');
    
    // Tìm người dùng theo email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ Không tìm thấy người dùng với email: ${email}`);
      return false;
    }
    
    // Nếu người dùng đã có quyền ADMIN
    if (user.role && user.role.toLowerCase() === 'admin') {
      console.log(`✅ Người dùng ${email} đã có quyền ADMIN.`);
      return true;
    }
    
    // Cập nhật quyền người dùng thành ADMIN
    user.role = 'ADMIN';
    await user.save();
    
    console.log(`✅ Đã cấp quyền ADMIN cho ${email} thành công.`);
    return true;
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật quyền người dùng: ${error.message}`);
    console.error(error);
    return false;
  } finally {
    // Đóng kết nối nếu đã mở
    if (connection) {
      await mongoose.disconnect();
      console.log('Đã đóng kết nối database.');
    }
  }
}

// Nếu script được chạy trực tiếp (không được import)
if (require.main === module) {
  const email = process.argv[2];
  
  if (!email) {
    console.error('❌ Thiếu email. Sử dụng: node set-admin.js <email>');
    process.exit(1);
  }
  
  setAdmin(email).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = setAdmin;
