const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const User = require("../models/user");

const createTransactionService = async (
  userId,
  voucherId,
  voucherName,
  price,
  paymentMethod,
  uploaderId
) => {
  try {
    const transaction = new Transaction({
      userId,
      voucherId,
      voucherName,
      price,
      paymentMethod,
      uploaderId,
      status: "Completed",
      createdAt: new Date(),
    });

    const savedTransaction = await transaction.save();
    return { success: true, transaction: savedTransaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, message: "Failed to create transaction" };
  }
};

const getTransactionsService = async (userId) => {
  try {
    const transactions = await Transaction.find({ userId }).sort({
      createdAt: -1,
    });
    console.log("Transactions found:", transactions);

    return { success: true, transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, message: "Failed to fetch transactions" };
  }
};

const getSellerInfo = async (uploaderId) => {
  try {
    const seller = await User.findById(uploaderId);
    if (!seller) {
      throw new Error("Seller not found");
    }
    return seller;
  } catch (error) {
    console.error("Error fetching seller info:", error);
    throw error;
  }
};

module.exports = {
  createTransactionService,
  getTransactionsService,
  getSellerInfo,
};
