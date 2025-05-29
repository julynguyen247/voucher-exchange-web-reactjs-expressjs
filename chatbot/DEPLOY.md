# filepath: /home/vngbthang/Documents/deploying/voucher-exchange-web-reactjs-expressjs/chatbot/DEPLOY.md
# Triển khai Rasa Chatbot trên Render

Hướng dẫn này mô tả các bước để triển khai chatbot Rasa trên nền tảng Render.

## Chuẩn bị

1. Đảm bảo bạn đã có tài khoản Render (https://render.com)
2. Đảm bảo bạn đã cập nhật file `endpoints.yml` để sử dụng URL máy chủ actions đúng (nếu có sử dụng custom actions)
3. Đảm bảo đã có file `requirements.txt` liệt kê đầy đủ thư viện cần thiết

## Các bước triển khai

1. Đăng nhập vào tài khoản Render của bạn
2. Tạo một dịch vụ mới bằng cách chọn "New > Blueprint" và kết nối repository của bạn
3. Hoặc chọn "New > Web Service" và kết nối repository của bạn thủ công
4. Trong quá trình cấu hình:
   - Đặt tên dịch vụ: "voucher-exchange-chatbot" (hoặc tên khác nếu bạn muốn)
   - Cấu hình như sau:
     - **Runtime**: Python
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `rasa run --enable-api --port $PORT --cors "*"`
     - **Python Version**: 3.10.12 (hoặc phiên bản tương thích với Rasa)

5. Trong phần cài đặt nâng cao (Advanced), thêm các biến môi trường:
   - `PYTHONUNBUFFERED`: `true`
   - `PYTHONPATH`: `${PYTHONPATH}:/opt/render/project`
   - `RASA_TELEMETRY_ENABLED`: `false`

6. Chọn gói dịch vụ phù hợp (Standard hoặc cao hơn vì Rasa cần nhiều tài nguyên)

7. Nhấn "Create Web Service" để bắt đầu triển khai

## Cấu hình kết nối

Sau khi triển khai thành công:

1. Lấy URL của chatbot từ trang tổng quan của dịch vụ trên Render (dạng https://voucher-exchange-chatbot.onrender.com)
2. Cập nhật biến môi trường `RASA_URL` trong dịch vụ backend của bạn để trỏ đến URL này
   - Trong trang tổng quan dịch vụ backend trên Render, chọn "Environment"
   - Thêm hoặc cập nhật biến môi trường `RASA_URL` thành URL của chatbot
   - Khởi động lại dịch vụ backend để áp dụng thay đổi

## Kiểm tra hoạt động

Để kiểm tra xem chatbot đã được triển khai thành công:

1. Truy cập URL của chatbot với đường dẫn `/version`, ví dụ: https://voucher-exchange-chatbot.onrender.com/version
2. Bạn sẽ thấy thông tin phiên bản của Rasa nếu triển khai thành công

## Xác minh kết nối với backend

Để xác minh backend có thể kết nối với chatbot:

1. Truy cập URL của backend và sử dụng tính năng chat để kiểm tra
2. Kiểm tra logs của backend trên Render để xem các yêu cầu đến chatbot có thành công không

## Gỡ lỗi

Nếu gặp vấn đề:
- Kiểm tra logs của dịch vụ chatbot trên Render
- Đảm bảo CORS được cấu hình đúng cho phép gọi từ frontend và backend
- Kiểm tra các biến môi trường đã được thiết lập chính xác

## Lưu ý

- Rasa cần khá nhiều RAM để chạy hiệu quả. Nếu bạn gặp lỗi hết bộ nhớ, hãy nâng cấp gói dịch vụ Render.
- Quá trình xây dựng (build) có thể mất vài phút do cần cài đặt nhiều thư viện Python.
