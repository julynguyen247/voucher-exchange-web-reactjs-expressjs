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
  const clientIp =
    socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;
  console.log(`Client connected: ${socket.id} from ${clientIp}`);

  // Add to active connections
  activeConnections.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    ip: clientIp,
  });

  // Log total number of connections
  console.log(`Total active connections: ${activeConnections.size}`);

  socket.on("user_message", async (msg) => {
    console.log(`User message from ${socket.id}:`, msg);

    try {
      console.log("Sending message to RASA:", msg);
      try {
        const rasaURL = process.env.RASA_URL || "http://localhost:5005";
        const rasaRes = await axios.post(
          `${rasaURL}/webhooks/rest/webhook`,
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
        console.error(
          "RASA connection error:",
          rasaError.message,
          rasaError.code
        );

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
const allowedOrigins = [
  "http://localhost:5173",                         // Local development
  "https://your-frontend-domain.vercel.app",       // Vercel production (cập nhật domain thực tế của bạn)
  process.env.FRONTEND_URL,                        // Từ biến môi trường nếu được thiết lập
];

app.use(
  cors({
    origin: function(origin, callback) {
      // Cho phép requests không có origin (như mobile apps hoặc curl)
      if (!origin) return callback(null, true);
      
      // Kiểm tra nếu origin nằm trong danh sách cho phép
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        console.log("CORS blocked request from:", origin);
        callback(null, true); // Tạm thời cho phép tất cả origin trong quá trình phát triển
        // Trong production, có thể chuyển thành: callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true, // Cho phép gửi cookie và thông tin xác thực
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
  })
);
// Cấu hình file upload
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn kích thước file: 10MB
  createParentPath: true // Tự động tạo thư mục nếu chưa tồn tại
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Phục vụ các tệp tĩnh
app.use('/images', express.static(path.join(__dirname, 'public/images')));

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

console.log("Serving static files from:", staticPath);

app.use("/images", express.static(path.join(staticPath, "images")));

// Log static file requests for debugging
app.use((req, res, next) => {
  if (req.url.startsWith("/images")) {
    console.log(`Static file request: ${req.method} ${req.url}`);
  }
  next();
});

app.use("/v1/api", apiRoutes);
app.use("/api/v1/auth", authRoutes); // Mount route auth

// Health check endpoint cho Render
app.get("/health", (req, res) => {
  // Kiểm tra kết nối database
  const dbState = mongoose.connection.readyState;
  if (dbState === 1) {
    // Database connected
    res.status(200).json({
      status: "ok",
      message: "API is running",
      database: "connected",
      timestamp: new Date()
    });
  } else {
    res.status(503).json({
      status: "error",
      message: "Database connection issue",
      database: "disconnected",
      timestamp: new Date()
    });
  }
});

// Trang chủ API
app.get("/", (req, res) => {
  res.send("API đang chạy rồi nè bro.");
});

// Middleware ghi log cho production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
      );
    });
    next();
  });
}

// Kết nối Database & Chạy server
(async () => {
  try {
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Attempting database connection to: ${process.env.MONGO_DB_URL?.substring(0, 20)}...`);
    
    // Make database connection
    await connection();

    // Test database connection by inserting and retrieving a test document
    const mongoose = require("mongoose");
    const TestModel = mongoose.model(
      "ConnectionTest",
      new mongoose.Schema({
        test: String,
        timestamp: { type: Date, default: Date.now },
      })
    );

    try {
      // Try to save a test document
      const testDoc = new TestModel({ test: "connection_test" });
      await testDoc.save();
      console.log("✅ Database write test successful");

      // Clean up test document
      await TestModel.deleteOne({ test: "connection_test" });
    } catch (dbTestError) {
      console.error("❌ Database write test failed:", dbTestError);
      // Continue anyway as the connection was established
    }

    // Check if RASA is running
    try {
      const rasaURL = process.env.RASA_URL || "http://localhost:5005";
      await axios.get(`${rasaURL}/version`, { timeout: 3000 });
      console.log(`✅ RASA server is running and reachable at ${rasaURL}`);
    } catch (rasaErr) {
      console.warn("⚠️ WARNING: RASA server appears to be down or unreachable");

      console.warn(
        "Chatbot functionality will be limited until RASA server is available"
      );
      console.warn(
        "To start RASA server, run: cd chatbot && rasa run --enable-api"
      );
    }

    server.listen(port, hostname, () => {
      console.log(`✅ Backend đang chạy ở: http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("❌ Lỗi khi kết nối database:", error);
  }
})();
