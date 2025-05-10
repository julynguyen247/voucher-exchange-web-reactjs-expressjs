require("dotenv").config({ path: "../.env" });
const express = require("express");
const session = require("express-session");
const passport = require("passport");
require("./config/passport"); 
const apiRoutes = require("./routes/api");
const authRoutes = require("./routes/authRoutes"); 
const connection = require("./config/database");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOST_NAME || "localhost";

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" },
});

//cấu hình websocket với rasa
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user_message", async (msg) => {
    console.log("User message:", msg);

    try {
      console.log("Sending message to RASA:", msg); 
      const rasaRes = await axios.post(
        "http://localhost:5005/webhooks/rest/webhook",
        {
          sender: socket.id,
          message: msg,
        },
        { timeout: 5000 } // Có thể cấu hình timeout nếu cần
      );

      console.log("RASA response:", rasaRes.data);

      // Gửi từng phần tử phản hồi về client (nguyên object, không chỉ text)
      rasaRes.data.forEach((responseObj) => {
        socket.emit("bot_reply", responseObj);
      });
    } catch (err) {
      console.error("RASA error:", err.message);
      socket.emit("bot_reply", {
        text: "Xin lỗi, có lỗi xảy ra ở chatbot.",
        type: "error",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
    server.listen(port, hostname, () => {
      console.log(`✅ Backend đang chạy ở: http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi kết nối database:", error);
  }
})();