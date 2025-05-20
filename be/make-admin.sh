#!/bin/bash

# Script đơn giản để cấp quyền ADMIN cho một người dùng
# Usage: ./make-admin.sh <email>

# Đặt thư mục hiện tại là thư mục chứa script
cd "$(dirname "$0")"

# Kiểm tra tham số
if [ $# -eq 0 ]; then
  echo "❌ Thiếu tham số email."
  echo "Cách sử dụng: ./make-admin.sh <email>"
  exit 1
fi

# Xử lý input có thể có tiền tố "admin:"
input=$1
if [[ $input == admin:* ]]; then
  email="${input#admin:}"
else
  email=$input
fi

# Chạy script Node.js
echo "🔑 Đang cấp quyền ADMIN cho: $email"
node src/utils/set-admin.js "$email"
