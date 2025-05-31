#!/bin/bash

# Script đơn giản để cấp quyền ADMIN cho một người dùng từ thư mục gốc
# Usage: ./make-admin.sh <email>

# Xác định đường dẫn tuyệt đối của thư mục chứa script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Chuyển đến thư mục backend
cd "$SCRIPT_DIR/be"

# Gọi script cấp quyền
./make-admin.sh "$@"
