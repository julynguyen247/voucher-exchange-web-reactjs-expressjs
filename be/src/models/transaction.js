const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  voucherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "voucher",
    required: true,
  },
  voucherName: { type: String, required: true },
  price: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["momo", "vietqr_bank_transfer"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  createBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
transactionSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
