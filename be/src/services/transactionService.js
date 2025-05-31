const mongoose = require("mongoose");
const Transaction = require("../models/transaction");

const createTransactionService = async (
  userId,
  voucherId,
  voucherName,
  price,
  paymentMethod,
  code
) => {
  try {
    const transaction = new Transaction({
      userId,
      voucherId,
      voucherName,
      price,
      paymentMethod,
      status: "Completed",
      createdAt: new Date(),
      code,
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

    return { success: true, transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, message: "Failed to fetch transactions" };
  }
};

module.exports = {
  createTransactionService,
  getTransactionsService,
};
