const express = require("express");
const {
  createUser,
  handleLogin,
  getUser,
  deleteUser,
  updateUser,
  handleLogout,
  handleFetchAccount,
  getAccount,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const {
  handleUploadImg,
  createVoucher,
  getVoucher,
  deleteVoucher,
  getPlatform,
  getCategory,
} = require("../controllers/voucherController");
const transactionController = require("../controllers/transactionController");
const routerAPI = express.Router();
routerAPI.all("*", auth);
routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world");
});
//user
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/logout", handleLogout);
routerAPI.get("/account", handleFetchAccount);
routerAPI.get("/account-fetch", getAccount);
//admin
routerAPI.post("/user", createUser);
routerAPI.get("/user", getUser);
routerAPI.delete("/user", deleteUser);
routerAPI.put("/user", updateUser);

//voucher
routerAPI.post("/image", handleUploadImg);
routerAPI.post("/voucher", createVoucher);
routerAPI.get("/voucher", getVoucher);
routerAPI.delete("/voucher", deleteVoucher);
routerAPI.get("/voucher/platform", getPlatform);
routerAPI.get("/voucher/category", getCategory);

//chatbot
const chatbotRoutes = require("./chatbotRoutes"); 
routerAPI.use("/chatbot", chatbotRoutes);

module.exports = routerAPI; //export default
