const mongoose = require("mongoose");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const Voucher = require("../models/voucher");

exports.processTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, voucherId } = req.body;

    // Check validation
    const user = await User.findById(userId).session(session);
    const voucher = await Voucher.findById(voucherId).session(session);

    if (!user || !voucher) throw new Error("Invalid user or voucher");
    if (user.balance < voucher.price) throw new Error("Insufficient balance");

    // Deduct balance from user and update voucher status
    user.balance -= voucher.price;
    voucher.status = "Sold";

    await user.save({ session });
    await voucher.save({ session });

    // Save transaction details
    const transaction = new Transaction({
      userId,
      voucherId,
      status: "Completed",
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, message: "Transaction completed" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ userId }).populate(
      "voucherId"
    );
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
