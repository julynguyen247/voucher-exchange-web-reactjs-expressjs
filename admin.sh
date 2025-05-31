#!/bin/bash

# Script để nhanh chóng cấp quyền admin cho một user từ thư mục gốc của dự án
# Usage: ./admin.sh admin:email@example.com
#   hoặc: ./admin.sh email@example.com

# Xác định đường dẫn tuyệt đối của thư mục chứa script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Chuyển đến thư mục backend
cd "$SCRIPT_DIR/be"

# Chạy script admin-role.sh với tham số đã cung cấp
./admin-role.sh "$@"
