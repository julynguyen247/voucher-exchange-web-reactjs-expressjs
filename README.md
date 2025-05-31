# 🌟 Nền Tảng Chia Sẻ Voucher/Giftcard

Ứng dụng web hỗ trợ người dùng chia sẻ, tìm kiếm và sử dụng voucher/giftcard một cách dễ dàng. Giao diện được xây dựng bằng **ReactJS**, backend bằng **ExpressJS**, và tích hợp chatbot **RASA** để hỗ trợ khách hàng thông minh bằng AI.

---

## 📚 Mục Lục

* [Tổng Quan Dự Án](#tổng-quan-dự-án)
* [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
* [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
* [Yêu Cầu Cần Có](#yêu-cầu-cần-có)
* [Cài Đặt và Thiết Lập](#cài-đặt-và-thiết-lập)
  * [Tải Repository](#tải-repository)
  * [Thiết Lập Backend (ExpressJS)](#thiết-lập-backend-expressjs)
  * [Thiết Lập Frontend (ReactJS)](#thiết-lập-frontend-reactjs)
  * [Thiết Lập Chatbot RASA](#thiết-lập-chatbot-rasa)
* [Chạy Dự Án](#chạy-dự-án)
* [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
* [Góp Ý & Đóng Góp](#góp-ý--đóng-góp)


---

## Tổng Quan Dự Án

Nền tảng cho phép người dùng:

* Đăng tải, chia sẻ và tìm kiếm các voucher/giftcard.
* Sử dụng giao diện hiện đại và phản hồi nhanh bằng **ReactJS**.
* Kết nối tới backend RESTful API bằng **ExpressJS + MongoDB**.
* Hỗ trợ khách hàng tự động nhờ chatbot **RASA**, tích hợp ngay trên website.

---

## Công Nghệ Sử Dụng

| Thành phần          | Công nghệ                   |
| ------------------- | --------------------------- |
| **Frontend**        | ReactJS, Vite, Tailwind CSS |
| **Backend**         | ExpressJS, Node.js          |
| **Chatbot**         | RASA (Python, NLP)          |
| **Database**        | MongoDB                     |
| **Thư viện hỗ trợ** | Axios, JWT, Google OAuth2   |

---
## Kiến trúc hệ thống
        +----------------------------+
        |        Trình Duyệt         |
        |     (ReactJS Frontend)     |
        +-------------+--------------+
                      |
                      | HTTP (REST API)
                      |
                      v
         +------------+-------------+
         |       ExpressJS Backend  |
         |        (Node.js)         |
         +-----+--------------+-----+
               |              |
               |              | MongoDB
               |              | (Dữ liệu voucher, user)
               |              v
               |       +------+--------+
               |       |   MongoDB     |<-------+
               |       +---------------+        |
               |                                |
               | WebSocket (socket.io)          | Lấy dữ liệu voucher
               v                                | 
        +------+----------------------+         |
        |        RASA Chatbot         |         |
        | (Python NLP + CustomActions)|---------+
        +-----------------------------+
---

## Yêu Cầu Cần Có

```bash
# Kiểm tra các yêu cầu hệ thống
node -v              # >= 16.x
python --version     # >= 3.8
mongo --version
git --version
```

* ✅ Node.js (>= 16)
* ✅ Python (>= 3.8)
* ✅ Git
* ✅ MongoDB
* ✅ RASA (`pip install rasa`)
* ✅ Docker (tuỳ chọn)

---

## Cài Đặt và Thiết Lập

### Tải Repository

```bash
git clone https://github.com/julynguyen247/voucher-exchange-web-reactjs-expressjs.git
cd voucher-exchange-web-reactjs-expressjs
```

---

### Thiết Lập Backend (ExpressJS)

```bash
cd be
npm install
```

Tạo file `.env` trong thư mục `be/`:

```env
NODE_ENV=development
PORT=8081
HOST_NAME=localhost

MONGO_DB_URL=mongodb://localhost:27017/mydatabase

JWT_SECRET=your_jwt_secret
JWT_EXPIRED=3d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Chạy backend:

```bash
npm run dev
```

---

### Thiết Lập Frontend (ReactJS)

```bash
cd ../fe
npm install
```

Tạo file `.env` trong thư mục `fe/`:

```env
VITE_BACKEND_URL=http://localhost:8081
```

Chạy frontend:

```bash
npm run dev
```

Truy cập tại: [http://localhost:5173](http://localhost:5173)

---

### Thiết Lập Chatbot RASA

```bash
cd ../chatbot
python -m venv venv
```

Kích hoạt môi trường ảo:

* **Linux/macOS**:

  ```bash
  source venv/bin/activate
  ```
* **Windows**:

  ```bash
  .\venv\Scripts\activate
  ```

Cài đặt RASA:

```bash
pip install rasa
```

Huấn luyện mô hình:

```bash
rasa train
```

Chạy RASA server:

```bash
rasa run --enable-api --cors "*" --port 5005
```

Trong một terminal mới, bật action server:

```bash
source venv/bin/activate  # Hoặc .\venv\Scripts\activate (Windows)
rasa run actions
```

---

## Chạy Dự Án

1. ✅ **Chạy Backend** tại `http://localhost:8081`
2. ✅ **Chạy Frontend** tại `http://localhost:5173`
3. ✅ **Chạy RASA Server** tại `http://localhost:5005`
4. ✅ **Chatbot** được tích hợp vào frontend qua API.

**Có thể chạy cả backend, frontend và RASA chỉ bằng 1 lệnh mà không cần dùng nhiều terminal:**
```bash
./start.bat
```

---

## Cấu Trúc Dự Án

```text
voucher-exchange-web-reactjs-expressjs/
├── be/                     # Backend ExpressJS
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── .env
├── fe/                   
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── style/
│   │   └── utils/
│   └── .env
├── chatbot/               
│   ├── actions/
│   ├── data/
│   │   ├── nlu.yml
│   │   ├── rules.yml
│   │   └── stories.yml
│   ├── models/
│   ├── tests/
│   ├── venv/ 
│   ├── .env
│   ├── config.yml
│   ├── credentials.yml
│   ├── domain.yml
│   └── endpoints.yml              
├── README.md
└── start.bat               
```

---
## Góp Ý & Đóng Góp

Nếu gặp vấn đề trong quá trình cài đặt, vui lòng liên hệ với nhóm phát triển.


