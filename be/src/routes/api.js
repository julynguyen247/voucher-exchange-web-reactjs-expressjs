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
  getSellerPaymentDetails,
  getBank,
  getUserById,
} = require("../controllers/userController");
const auth = require("../middleware/auth");
const { checkJWT } = require("../middleware/auth");
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

const { simulateMomoWebhook } = require("../controllers/paymentController");
const {
  createPayment,
  vnpayReturn,
  checkTransactionStatus,
} = require("../controllers/vnpayController");
const transactionController = require("../controllers/transactionController");
const {
  addFavorite,
  getUserFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");
const {
  isAdmin,
  getDashboardStats,
  updateUserRole,
  checkUserRole,
} = require("../controllers/adminController");

const routerAPI = express.Router();
routerAPI.all("*", auth);
routerAPI.get("/", (req, res) => {
  return res.status(200).json("Hello world");
});

const {
  rating,
  getUsersWithRatings,
} = require("../controllers/ratingController");

//rating
routerAPI.post("/user/:id/rating", auth, rating);
routerAPI.get("/user/ratings", getUsersWithRatings);

//user
routerAPI.get("/bank", getBank);
routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.post("/logout", handleLogout);
routerAPI.get("/account", handleFetchAccount);
routerAPI.get("/account-fetch", getAccount);
routerAPI.get("/seller-payment-details", getSellerPaymentDetails);
routerAPI.get("/user/:id", getUserById);

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

//payment
routerAPI.post("/payment/momo/simulate-webhook", simulateMomoWebhook);
routerAPI.post("/payment/vnpay/create-payment", createPayment);
routerAPI.get("/payment/vnpay/vnpay-return", vnpayReturn);
routerAPI.get(
  "/payment/vnpay/check-transaction/:transactionId",
  auth,
  checkTransactionStatus
);

//favorites
routerAPI.post("/favorites", addFavorite);
routerAPI.get("/favorites/:userId", getUserFavorites);
routerAPI.delete("/favorites", removeFavorite);

//admin
routerAPI.get("/admin/stats", auth, isAdmin, getDashboardStats);
routerAPI.post("/admin/update-role", auth, isAdmin, updateUserRole);
routerAPI.get("/admin/check-user-role", checkUserRole); // Debug endpoint - no auth required for testing

module.exports = routerAPI; //export default
