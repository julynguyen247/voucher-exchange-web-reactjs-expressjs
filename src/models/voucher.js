const mongoose = require("mongoose");
const voucherSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    image: String,
    discountValue: Number,
    expirationDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: String,
  },
  { timestamps: true }
);
const Voucher = mongoose.model("voucher", voucherSchema);
module.exports = Voucher;
