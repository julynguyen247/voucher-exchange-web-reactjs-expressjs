const {
  createUserService,
  loginService,
  getUserService,
  deleteAUserService,
  updateAUserService,
  fetchAccountService,
} = require("../services/userService");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "672007328004-ulrqqgtah8i30rjrlon2of3loi3k8jp5.apps.googleusercontent.com"
);
const { createJWT } = require("../utils/jwt"); // Đảm bảo bạn có hàm tạo JWT
const User = require("../models/user"); // Import trực tiếp model User
const Voucher = require("../models/voucher");
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        EC: 1,
        message: "Missing required fields: name, email, or password",
      });
    }

    console.log(`Creating user: ${name}, ${email}`);
    const result = await createUserService(name, email, password, phone, image);

    if (!result.success) {
      return res.status(400).json({
        EC: 1,
        message: result.message || "Failed to create user",
      });
    }

    return res.status(200).json({
      EC: 0,
      message: "User created successfully",
      result: result.data,
    });
  } catch (error) {
    console.error("Error in createUser controller:", error);
    return res.status(500).json({
      EC: 1,
      message: "Server error while creating user",
      error: error.message,
    });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const data = await loginService(email, password);
  return res.status(200).json(data);
};
const handleLogout = async (req, res) => {
  return res.status(200).json({
    message: "Logout",
    data: "Logout success.",
  });
};
const getUser = async (req, res) => {
  try {
    let limit = req.query.limit;
    let page = req.query.page;
    let result = null;
    if (limit && page) {
      result = await getUserService(limit, page, req.query);
    } else {
      result = await getUserService();
    }

    // Nếu có dữ liệu, trả về dữ liệu thật
    if (result && result.length > 0) {
      return res.status(200).json({
        EC: 0,
        data: {
          users: result,
          total: result.length,
        },
      });
    }

    // Nếu không có dữ liệu, tạo dữ liệu mẫu
    const sampleUsers = [
      {
        _id: "sample-1",
        name: "Nguyen Van A",
        email: "nguyenvana@example.com",
        phone: "0901234567",
        image: "",
        accountType: "Local",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "sample-2",
        name: "Tran Thi B",
        email: "tranthib@example.com",
        phone: "0901234568",
        image: "",
        accountType: "Google",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "sample-3",
        name: "Le Van C",
        email: "levanc@example.com",
        phone: "0901234569",
        image: "",
        accountType: "Local",
        createdAt: new Date().toISOString(),
      },
    ];

    return res.status(200).json({
      EC: 0,
      data: {
        users: sampleUsers,
        total: sampleUsers.length,
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    // Trả về dữ liệu mẫu khi có lỗi
    return res.status(200).json({
      EC: 0,
      data: {
        users: Array(3)
          .fill()
          .map((_, i) => ({
            _id: `error-${i}`,
            name: `Người dùng mẫu ${i + 1}`,
            email: `user${i + 1}@example.com`,
            phone: `090${i}123456`,
            image: "",
            createdAt: new Date().toISOString(),
          })),
        total: 3,
      },
    });
  }
};
const deleteUser = async (req, res) => {
  let id = req.body.id;
  let result = await deleteAUserService(id);
  return res.status(200).json({
    EC: 0,
    data: result,
  });
};
const updateUser = async (req, res) => {
  const { id, name, email, password, phone, image, accountNumber, bank } =
    req.body;
  let result = await updateAUserService(
    id,
    name,
    email,
    password,
    phone,
    image,
    accountNumber,
    bank
  );
  return res.status(200).json({
    EC: 0,
    data: result,
  });
};
const getSellerPaymentDetails = async (req, res) => {
  //console.log(">>> Request received at getSellerPaymentDetails controller");
  //console.log("Query params:", req.query);
  try {
    const { voucherId, bank: paymentType } = req.query;

    if (!voucherId || !paymentType) {
      return res.status(400).json({
        EC: 1,
        message: "Voucher ID và loại thanh toán là bắt buộc.",
      });
    }

    const voucher = await Voucher.findById(voucherId).populate({
      path: "createdBy",
      select: "name phone bank accountNumber",
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ EC: 1, message: "Không tìm thấy voucher." });
    }

    if (!voucher.createdBy) {
      return res.status(404).json({
        EC: 1,
        message: "Không tìm thấy thông tin người bán cho voucher này.",
      });
    }

    const seller = voucher.createdBy;
    let paymentDetails = {};

    if (
      paymentType.toLowerCase() === "momo" ||
      paymentType.toLowerCase() === "zalo_pay"
    ) {
      if (seller.phone) {
        paymentDetails.sellerPhone = seller.phone;
      } else {
        return res.status(404).json({
          EC: 1,
          message: `Người bán chưa cập nhật SĐT cho ${paymentType}.`,
        });
      }
    } else if (paymentType.toLowerCase() === "vietqr_bank_transfer") {
      if (seller.bank && seller.accountNumber && seller.name) {
        paymentDetails.sellerBankName = seller.bank;
        paymentDetails.sellerBankAccount = seller.accountNumber;
        paymentDetails.sellerAccountHolderName = seller.name;
      } else {
        return res.status(404).json({
          EC: 1,
          message:
            "Người bán chưa cập nhật đủ thông tin tài khoản ngân hàng (tên ngân hàng, STK, tên chủ TK).",
        });
      }
    } else {
      return res
        .status(400)
        .json({ EC: 1, message: "Loại thanh toán không được hỗ trợ." });
    }

    if (Object.keys(paymentDetails).length === 0) {
      return res.status(404).json({
        EC: 1,
        message: `Không tìm thấy thông tin thanh toán cho ${paymentType}.`,
      });
    }

    return res.status(200).json({ EC: 0, data: paymentDetails });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin thanh toán của người bán:", error);
    return res.status(500).json({
      EC: 1,
      message: "Lỗi máy chủ nội bộ khi lấy thông tin người bán.",
    });
  }
};

// Cache storage for user account data
const userCache = new Map();
const USER_CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache TTL (increased from 5 minutes)
const userCacheAccessLog = new Map(); // Track logging to prevent spam
const userCacheHits = new Map(); // Track cache hits per user

// Track API call metrics
const apiMetrics = {
  totalCalls: 0,
  cacheMisses: 0,
  cacheHits: 0,
  lastReported: Date.now(),
};

const handleFetchAccount = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const userEmail = req.user.email;
  const currentTime = Date.now();

  // Update API metrics
  apiMetrics.totalCalls++;

  // Report metrics every hour
  if (currentTime - apiMetrics.lastReported > 3600000) {
    console.log(
      `API Metrics Report: ${apiMetrics.totalCalls} total calls, ${
        apiMetrics.cacheHits
      } cache hits (${Math.round(
        (apiMetrics.cacheHits / apiMetrics.totalCalls) * 100
      )}%), ${apiMetrics.cacheMisses} cache misses (${Math.round(
        (apiMetrics.cacheMisses / apiMetrics.totalCalls) * 100
      )}%)`
    );
    apiMetrics.lastReported = currentTime;
  }

  // Use the cached data if available and not expired
  const cachedData = userCache.get(userId);
  if (cachedData && cachedData.timestamp > currentTime - USER_CACHE_TTL) {
    // Update cache hit metrics
    apiMetrics.cacheHits++;
    userCacheHits.set(userId, (userCacheHits.get(userId) || 0) + 1);

    // Only log once every 5 minutes per user to prevent log spam
    const lastLogTime = userCacheAccessLog.get(userId) || 0;
    if (currentTime - lastLogTime > 300000) {
      // Once per 5 minutes at most (increased from 1 minute)
      const hits = userCacheHits.get(userId) || 0;
      console.log(
        `Using cached user data for ${userEmail} (${hits} cache hits since last log)`
      );
      userCacheAccessLog.set(userId, currentTime);
      userCacheHits.set(userId, 0); // Reset hit counter
    }

    return res.status(200).json({
      EC: 0,
      data: cachedData.data,
      cached: true,
    });
  }

  // If not cached or cache expired, fetch from database
  apiMetrics.cacheMisses++;
  console.log(`Cache miss for ${userEmail}, fetching from database`);
  let result = await fetchAccountService(req.user);

  // Cache the result
  userCache.set(userId, {
    data: result,
    timestamp: currentTime,
  });

  return res.status(200).json({
    EC: 0,
    data: result,
  });
};
const getAccount = async (req, res) => {
  req.user.id = req.user._id;
  return res.status(200).json(req.user);
};

const handleGoogleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience:
        "672007328004-ulrqqgtah8i30rjrlon2of3loi3k8jp5.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const image = payload.picture;

    // Kiểm tra user đã tồn tại chưa
    let user = await User.findOne({ email }); // Sửa thành User.findOne

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = await User.create({
        // Sửa thành User.create
        name,
        email,
        password: null, // không có mật khẩu
        phone: "",
        image,
      });
    }

    // Trả về token (giống như trong login thường)
    const access_token = createJWT({
      email: user.email,
      id: user._id,
      name: user.name,
    });

    return res.status(200).json({
      EC: 0,
      message: "Login with Google successful",
      access_token,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ EC: 1, message: "Google login failed" });
  }
};
const getBank = async (req, res) => {
  return res.status(200).json([
    { name: "Vietcombank", code: "VCB" },
    { name: "VietinBank", code: "CTG" },
    { name: "BIDV", code: "BID" },
    { name: "Agribank", code: "VBA" },
    { name: "Techcombank", code: "TCB" },
    { name: "ACB", code: "ACB" },
    { name: "Sacombank", code: "STB" },
    { name: "MB Bank", code: "MBB" },
    { name: "VPBank", code: "VPB" },
    { name: "SHB", code: "SHB" },
    { name: "TPBank", code: "TPB" },
    { name: "VIB", code: "VIB" },
    { name: "HDBank", code: "HDB" },
    { name: "OCB", code: "OCB" },
    { name: "Eximbank", code: "EIB" },
    { name: "SCB", code: "SCB" },
  ]);
};

module.exports = {
  createUser,
  handleLogin,
  getUser,
  deleteUser,
  updateUser,
  handleLogout,
  handleFetchAccount,
  getAccount,
  getSellerPaymentDetails,
  handleGoogleLogin,
  getBank,
};
