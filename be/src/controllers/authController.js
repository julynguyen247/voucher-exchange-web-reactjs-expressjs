const jwt = require("jsonwebtoken");

const handleGoogleLogin = async (req, res) => {
  try {
    const { email, name, image } = req.body;

    // Kiểm tra thông tin người dùng (nếu cần, bạn có thể kiểm tra trong database)
    if (!email || !name) {
      return res.status(400).json({ EC: 1, EM: "Thiếu thông tin người dùng" });
    }

    // Tạo access token
    const payload = { email, name };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRED || "1d",
    });

    // Trả về token và thông tin người dùng
    return res.status(200).json({
      EC: 0,
      EM: "Đăng nhập thành công",
      access_token: accessToken,
      user: { email, name, image },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ EC: 1, EM: "Lỗi server" });
  }
};

module.exports = {
  handleGoogleLogin,
};