# Backend Voucher Exchange - Hướng dẫn triển khai trên Render

## Tổng quan
Backend của hệ thống Voucher Exchange được xây dựng bằng Express.js và MongoDB. Hướng dẫn này sẽ giúp bạn triển khai backend lên nền tảng Render.

## Các bước triển khai

### 1. Đăng ký tài khoản Render
- Truy cập [render.com](https://render.com) và đăng ký tài khoản mới
- Xác nhận email đăng ký

### 2. Tạo Web Service mới
- Đăng nhập vào Render
- Nhấn "New +" và chọn "Web Service"
- Kết nối với GitHub repository của bạn
- Chọn repository và nhánh chứa code

### 3. Cấu hình dịch vụ
- **Tên**: voucher-exchange-backend
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Directory**: `be` (nếu bạn chọn repository gốc)
- **Node Version**: 18.x

### 4. Thiết lập biến môi trường
Thêm các biến môi trường sau:
```
NODE_ENV=production
HOST_NAME=0.0.0.0
PORT=10000
MONGO_DB_URL=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRED=7d
RASA_URL=<your_rasa_url_after_deployment>
FRONTEND_URL=<your_frontend_url>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
OPENAI_API_KEY=<your_openai_api_key>
```

### 5. Tính năng bổ sung
- **Auto-Deploy**: Bật để tự động triển khai khi có thay đổi code
- **Health Check Path**: `/health`
- **Resource**: Chọn Free hoặc gói phù hợp với nhu cầu của bạn

## Kiểm tra sau khi triển khai
- Truy cập URL được cung cấp sau khi triển khai thành công
- Kiểm tra endpoint `/health` để đảm bảo API hoạt động
- Thử kết nối từ frontend đến backend API

## Khắc phục sự cố
- Kiểm tra logs trong Render dashboard
- Đảm bảo MongoDB connection string chính xác
- Kiểm tra cấu hình CORS cho phép frontend của bạn

## Bảo mật
- Đảm bảo JWT_SECRET đủ mạnh và phức tạp
- Không chia sẻ API keys hoặc credentials trong mã nguồn công khai
- Giới hạn quyền truy cập MongoDB theo IP nếu có thể
