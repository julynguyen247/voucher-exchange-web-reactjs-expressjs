require("dotenv").config({ path: "../.env" });
const express = require("express");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");

const app = express();
const port = process.env.PORT || 8081;
const hostname = process.env.HOST_NAME || "localhost";

// Cấu hình middleware
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình thư mục tĩnh
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/v1/api", apiRoutes);

// Trang chủ API
app.get("/", (req, res) => {
  res.send("Hello! API đang chạy...");
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
