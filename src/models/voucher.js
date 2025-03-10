const mongoose = require("mongoose");
const mongoose_delete = require('mongoose-delete');
const voucherSchema = new mongoose.Schema(
  {
    title: String,
    category: String,
    image: String,
    discountValue: Number,
    expirationDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    status: String,
  },
  { timestamps: true }
);
voucherSchema.plugin(mongoose_delete,{ overrideMethods: 'all' });
const Voucher = mongoose.model("voucher", voucherSchema);
module.exports = Voucher;
