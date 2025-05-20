#!/bin/bash

# Script để nhanh chóng cấp quyền admin cho một user
# Usage: ./admin-role.sh admin:email@example.com
#   hoặc: ./admin-role.sh email@example.com

# Đặt thư mục hiện tại là thư mục chứa script
cd "$(dirname "$0")"

# Đảm bảo biến môi trường từ file .env được load
if [ -f .env ]; then
  echo "Đang tải biến môi trường từ file .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "Cảnh báo: Không tìm thấy file .env"
fi

# Kiểm tra xem có tham số được cung cấp không
if [ $# -eq 0 ]; then
  echo "Usage: ./admin-role.sh admin:email@example.com"
  echo "   or: ./admin-role.sh email@example.com"
  exit 1
fi

# Phân tích tham số đầu vào
input=$1

# Nếu input có định dạng admin:email
if [[ $input == admin:* ]]; then
  # Tách email sau dấu ':'
  email="${input#admin:}"
else
  # Nếu không có tiền tố, lấy toàn bộ tham số là email
  email=$input
fi

# Kiểm tra email có hợp lệ không (đơn giản)
if [[ ! $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "Error: '$email' không phải là một email hợp lệ."
  exit 1
fi

# Hiển thị thông tin
echo "Đang cấp quyền ADMIN cho: $email"

# Chạy script Node.js cập nhật quyền
node src/utils/update-user-role.js "$email" "ADMIN"

# Kiểm tra kết quả
if [ $? -eq 0 ]; then
  echo "✅ Đã cấp quyền ADMIN thành công cho $email"
else
  echo "❌ Không thể cấp quyền ADMIN cho $email. Vui lòng kiểm tra lỗi phía trên."
fi
