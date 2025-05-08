require("dotenv").config({ path: "../.env" });
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // <-- Phải có dòng này để khởi tạo chiến lược
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/authRoutes"); // Thêm route xác thực
const connection = require("./config/database");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOST_NAME || "localhost";

// Cấu hình middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Địa chỉ frontend
    credentials: true, // Cho phép gửi cookie và thông tin xác thực
  })
);
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
app.use(
  session({
    secret: "yourSecretKey", // Thay bằng giá trị bí mật của bạn
    resave: false,
    saveUninitialized: false,
  })
);

// Cấu hình Passport
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình thư mục tĩnh
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/v1/api", apiRoutes);
app.use("/api/v1/auth", authRoutes); // Mount route auth

// Trang chủ API
app.get("/", (req, res) => {
  res.send("API đang chạy rồi nè bro.");
});

// Kết nối Database & Chạy server
(async () => {
  try {
    await connection();
    app.listen(port, hostname, () => {
      console.log(`✅ Backend đang chạy ở: http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi kết nối database:", error);
  }
})();
