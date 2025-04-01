const express = require("express");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOST_NAME || "localhost";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Kiểm tra nếu chưa có API Key thì cảnh báo
if (!OPENAI_API_KEY) {
  console.error("❌ Lỗi: Chưa cấu hình OPENAI_API_KEY trong file .env");
  process.exit(1);
}

// Cấu hình middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình thư mục tĩnh
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/v1/api", apiRoutes);

// API Chatbot kết nối OpenAI
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Nội dung tin nhắn không hợp lệ!" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("❌ Lỗi khi gọi OpenAI API:", error.response?.data || error.message);
    res.status(500).json({ error: "Không thể kết nối tới OpenAI API." });
  }
});

// Trang chủ API
app.get("/", (req, res) => {
  res.send("Hello! API đang chạy...");
});

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
