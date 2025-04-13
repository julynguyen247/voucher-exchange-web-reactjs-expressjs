require("dotenv").config({ path: "../.env" });
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/authRoutes"); // Thêm route xác thực
const connection = require("./config/database");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
require('./config/passport'); // Cấu hình Passport

const app = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOST_NAME || "localhost";

// Cấu hình middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình session
app.use(
  session({
    secret: "mySecret", // Thay bằng giá trị bí mật của bạn
    resave: false,
    saveUninitialized: true,
  })
);

// Cấu hình Passport
app.use(passport.initialize());
app.use(passport.session());

// Cấu hình thư mục tĩnh
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/v1/api", apiRoutes);
app.use("/auth", authRoutes); // Thêm route xác thực

// Trang chủ API
app.get("/", (req, res) => {
  res.send("API đang chạy rồi nè bro.");
});

console.log("OpenAI API Key:", process.env.OPENAI_API_KEY);

// Kết nối Database & Chạy server
(async () => {
  try {
    await connection();
    app.listen(port, hostname, () => {
      console.log(`✅ Backend is running at: http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("❌ Error while connecting database:", error);
  }
})();
