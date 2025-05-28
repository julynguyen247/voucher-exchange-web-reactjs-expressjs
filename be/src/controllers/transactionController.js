const mongoose = require("mongoose");
const {
  createTransactionService,
  getTransactionsService,
} = require("../services/transactionService");
const User = require("../models/user");
const Voucher = require("../models/voucher");

const processTransaction = async (req, res) => {
  try {
    const { userId, voucherId, voucherName, price, paymentMethod } = req.body;

    if (!userId || !voucherId || !voucherName || !price || !paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const voucher = await Voucher.findById(voucherId).populate("createdBy");
    if (!voucher || !voucher.createdBy) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin người bán",
      });
    }

    const sellerPhone = voucher.createdBy.phone;
    const sellerBankAccount = voucher.createdBy.bankAccount || "Đang cập nhật";
    const sellerBankName = voucher.createdBy.bankName || "Đang cập nhật";

    const data = await createTransactionService(
      userId,
      voucherId,
      voucherName,
      price,
      paymentMethod
    );

    return res.status(200).json({
      success: true,
      message: "Transaction successful",
      transaction: data.transaction,
      sellerPhone,
      sellerBankAccount,
      sellerBankName,
    });
  } catch (error) {
    console.error("Error processing transaction:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });
    const userId = user._id;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing userId",
      });
    }

    const result = await getTransactionsService(userId);
    return res.status(200).json({
      success: true,
      message: "Transactions fetched successfully",
      data: result.transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
module.exports = {
  processTransaction,
  getTransactions,
};
