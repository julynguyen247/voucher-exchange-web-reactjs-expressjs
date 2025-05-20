require("dotenv").config();
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
// Track active connections
const activeConnections = new Map();

io.on("connection", (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  console.log(`Client connected: ${socket.id} from ${clientIp}`);
  
  // Add to active connections
  activeConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    ip: clientIp
  });
  
  // Log total number of connections
  console.log(`Total active connections: ${activeConnections.size}`);

  socket.on("user_message", async (msg) => {
    console.log(`User message from ${socket.id}:`, msg);

    try {
      console.log("Sending message to RASA:", msg); 
      try {
        const rasaRes = await axios.post(
          "http://localhost:5005/webhooks/rest/webhook",
          {
            sender: socket.id,
            message: msg,
          },
          { timeout: 5000 } // Có thể cấu hình timeout nếu cần
        );

        console.log("RASA response:", rasaRes.data);

        // Check if RASA returned any responses
        if (rasaRes.data && rasaRes.data.length > 0) {
          // Gửi từng phần tử phản hồi về client (nguyên object, không chỉ text)
          rasaRes.data.forEach((responseObj) => {
            socket.emit("bot_reply", responseObj);
          });
        } else {
          // RASA didn't return any meaningful response
          socket.emit("bot_reply", {
            text: "Tôi không hiểu câu hỏi của bạn. Vui lòng thử lại với câu hỏi khác.",
          });
        }
      } catch (rasaError) {
        console.error("RASA connection error:", rasaError.message, rasaError.code);
        
        // Provide a helpful fallback response
        socket.emit("bot_reply", {
          text: "Xin lỗi, dịch vụ chatbot đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
        });
        
        // Also send a fallback response with common questions
        setTimeout(() => {
          socket.emit("bot_reply", {
            text: "Trong khi chờ dịch vụ chatbot phục hồi, bạn có thể tìm hiểu về cách sử dụng voucher hoặc cách tạo tài khoản bằng cách truy cập mục trợ giúp.",
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Socket handling error:", err.message, err.stack);
      socket.emit("bot_reply", {
        text: "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Remove from active connections
    activeConnections.delete(socket.id);
    console.log(`Remaining active connections: ${activeConnections.size}`);
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
const staticPath = path.join(__dirname, "public");
console.log('Serving static files from:', staticPath);
app.use("/images", express.static(path.join(staticPath, "images")));

// Log static file requests for debugging
app.use((req, res, next) => {
  if (req.url.startsWith('/images')) {
    console.log(`Static file request: ${req.method} ${req.url}`);
  }
  next();
});

app.use("/v1/api", apiRoutes);
app.use("/api/v1/auth", authRoutes); // Mount route auth

// Trang chủ API
app.get("/", (req, res) => {
  res.send("API đang chạy rồi nè bro.");
});

// Kết nối Database & Chạy server
(async () => {
  try {
    // Make database connection
    await connection();
    
    // Test database connection by inserting and retrieving a test document
    const mongoose = require('mongoose');
    const TestModel = mongoose.model('ConnectionTest', new mongoose.Schema({
      test: String,
      timestamp: { type: Date, default: Date.now }
    }));
    
    try {
      // Try to save a test document
      const testDoc = new TestModel({ test: 'connection_test' });
      await testDoc.save();
      console.log('✅ Database write test successful');
      
      // Clean up test document
      await TestModel.deleteOne({ test: 'connection_test' });
    } catch (dbTestError) {
      console.error('❌ Database write test failed:', dbTestError);
      // Continue anyway as the connection was established
    }
    
    // Check if RASA is running
    try {
      await axios.get("http://localhost:5005/version", { timeout: 3000 });
      console.log("✅ RASA server is running and reachable");
    } catch (rasaErr) {
      console.warn("⚠️ WARNING: RASA server appears to be down or unreachable");
      console.warn("Chatbot functionality will be limited until RASA server is available");
      console.warn("To start RASA server, run: cd chatbot && rasa run --enable-api");
    }
    
    server.listen(port, hostname, () => {
      console.log(`✅ Backend đang chạy ở: http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi kết nối database:", error);
  }
})();