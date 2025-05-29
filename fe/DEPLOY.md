# Hướng dẫn triển khai Frontend lên Vercel

Tài liệu này cung cấp hướng dẫn chi tiết để triển khai frontend React của ứng dụng Voucher Exchange lên Vercel.

## Các yêu cầu

1. Tài khoản Vercel (đăng ký miễn phí tại [vercel.com](https://vercel.com))
2. Kết nối Vercel với tài khoản GitHub của bạn
3. Backend đã được triển khai thành công trên Render

## Các bước thực hiện

### 1. Chuẩn bị mã nguồn

Các file cấu hình cần thiết đã được tạo/cập nhật:

- `vercel.json`: Cấu hình Vercel với rewrites và build commands
- `.env.production`: Chứa biến môi trường VITE_BACKEND_URL trỏ đến backend đã triển khai
- `vite.config.js`: Đã được cập nhật với cấu hình base path và build optimization

### 2. Commit và push code lên GitHub

```bash
git add fe/.env.production fe/vercel.json
git commit -m "Chuẩn bị triển khai frontend lên Vercel"
git push
```

### 3. Triển khai lên Vercel

#### Phương pháp 1: Sử dụng giao diện web Vercel

1. Đăng nhập vào tài khoản Vercel tại [vercel.com](https://vercel.com)
2. Nhấp vào "Add New..." > "Project"
3. Chọn repository GitHub của bạn từ danh sách
4. Cấu hình dự án:
   - **Project Name**: `voucher-exchange-frontend` (hoặc tên bạn muốn)
   - **Framework Preset**: Vite
   - **Root Directory**: `fe` (quan trọng - đây là thư mục chứa mã nguồn frontend)
   - **Build Command**: Giữ nguyên (Vercel sẽ tự động sử dụng lệnh từ vercel.json hoặc package.json)
   - **Output Directory**: Giữ nguyên (mặc định là `dist` cho Vite)
   - **Environment Variables**: Các biến này đã được định nghĩa trong `.env.production`, nhưng bạn có thể thêm hoặc ghi đè nếu cần

5. Nhấp vào "Deploy"

#### Phương pháp 2: Sử dụng Vercel CLI

1. Cài đặt Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Di chuyển vào thư mục frontend:
   ```bash
   cd /home/vngbthang/Documents/deploying/voucher-exchange-web-reactjs-expressjs/fe
   ```

3. Đăng nhập và triển khai:
   ```bash
   vercel login
   vercel
   ```

4. Trả lời các câu hỏi:
   - Xác nhận thư mục hiện tại là thư mục gốc: Yes
   - Liên kết với dự án hiện có: No (trừ khi đã tạo trước đó)
   - Tên dự án: voucher-exchange-frontend (hoặc theo ý muốn)
   - Thư mục gốc: ./ (vì đã ở trong thư mục fe)

### 4. Kiểm tra triển khai

1. Sau khi triển khai hoàn tất, Vercel sẽ cung cấp URL cho ứng dụng của bạn (dạng https://voucher-exchange-frontend.vercel.app)
2. Truy cập URL để kiểm tra ứng dụng
3. Đảm bảo các tính năng hoạt động đúng:
   - Đăng nhập/đăng ký
   - Xem và tương tác với voucher
   - Chatbot (kết nối với backend + Rasa)

### 5. Cấu hình tên miền tùy chỉnh (tùy chọn)

1. Trong dashboard Vercel, chọn dự án của bạn
2. Chọn "Settings" > "Domains"
3. Thêm tên miền tùy chỉnh của bạn
4. Làm theo hướng dẫn để cấu hình DNS

### 6. Cập nhật biến môi trường FRONTEND_URL trong backend (nếu cần)

Sau khi có URL chính thức của frontend, cập nhật biến môi trường `FRONTEND_URL` trong phần cài đặt của dịch vụ backend trên Render:

1. Đăng nhập vào Render Dashboard
2. Chọn dịch vụ backend 
3. Chọn "Environment" > chỉnh sửa biến `FRONTEND_URL`
4. Đặt giá trị thành URL mới của frontend (ví dụ: https://voucher-exchange-frontend.vercel.app)
5. Khởi động lại dịch vụ backend

## Xử lý sự cố

### CORS Issues

Nếu gặp lỗi CORS khi frontend cố gắng kết nối với backend:
1. Kiểm tra cấu hình CORS trong `be/src/server.js`
2. Đảm bảo URL frontend của bạn được thêm vào `allowedOrigins`
3. Cập nhật cấu hình và triển khai lại backend nếu cần

### API Endpoints không hoạt động

Nếu API không phản hồi:
1. Kiểm tra `VITE_BACKEND_URL` trong `.env.production` trên frontend
2. Xác minh rằng backend đang chạy bằng cách truy cập endpoint kiểm tra sức khỏe: `https://voucher-exchange-backend.onrender.com/health`
3. Kiểm tra logs của backend trên Render để tìm lỗi tiềm ẩn

### Build Failures

Nếu build frontend thất bại trên Vercel:
1. Kiểm tra logs build trên dashboard Vercel
2. Đảm bảo tất cả dependencies đã được khai báo trong `package.json`
3. Xác minh rằng cấu hình trong `vite.config.js` và `vercel.json` đúng

## Tài liệu tham khảo

- [Tài liệu triển khai Vercel](https://vercel.com/docs/deployments/overview)
- [Tài liệu Vite](https://vitejs.dev/guide/build.html)
- [Cấu hình React trên Vercel](https://vercel.com/guides/deploying-react-with-vercel)
