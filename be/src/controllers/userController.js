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

const createUser = async (req, res) => {
  const { name, email, password, phone, image } = req.body;
  const data = await createUserService(name, email, password, phone, image);
  return res.status(200).json({
    result: data,
  });
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
  let limit = req.query.limit;
  let page = req.query.page;
  let result = null;
  if (limit && page) {
    result = await getUserService(limit, page, req.query);
  } else {
    result = await getUserService();
  }

  return res.status(200).json(result);
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
  const { id, name, email, password, phone, image } = req.body;
  let result = await updateAUserService(
    id,
    name,
    email,
    password,
    phone,
    image
  );
  return res.status(200).json({
    EC: 0,
    data: result,
  });
};
const handleFetchAccount = async (req, res) => {
  let result = await fetchAccountService(req.user);
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
const getBank = () => {
  return [
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
  ];
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
  handleGoogleLogin,
  getBank,
};
