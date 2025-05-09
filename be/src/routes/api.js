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
  getBank,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const {
  handleUploadImg,
  createVoucher,
  getVoucher,
  deleteVoucher,
  getPlatform,
  getCategory,
  rateVoucher,
} = require("../controllers/voucherController");
const {
  processTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const transactionController = require("../controllers/transactionController");
const {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");
const routerAPI = express.Router();
routerAPI.all("*", auth);
routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world");
});
//user
routerAPI.get("/bank", getBank);
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
routerAPI.post("/voucher/:id/rate", rateVoucher);

//transaction
routerAPI.post("/transaction/process", processTransaction);
routerAPI.get("/transaction/get", getTransactions);

//favorites
routerAPI.post("/favorites", addFavorite);
routerAPI.get("/favorites/:userId", getUserFavorites);
routerAPI.delete("/favorites", removeFavorite);

module.exports = routerAPI; //export default
