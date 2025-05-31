const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const handleGoogleLogin = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    // Lưu thông tin người dùng vào database
    const user = await User.findOneAndUpdate(
      { email },
      { name, email },
      { upsert: true, new: true }
    );

    // Tạo JWT token
    const token = jwt.sign({ 
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    }, 
    process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      EC: 0,
      EM: "Đăng nhập thành công",
      access_token: token,
      user,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ EC: 1, EM: "Lỗi hệ thống khi login Google" });
  }
};

module.exports = {
  handleGoogleLogin,
};