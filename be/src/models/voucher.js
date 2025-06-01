const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const voucherSchema = new mongoose.Schema(
  {
    minimumOrder: Number,
    platform: String,
    category: String,
    code: String,
    image: String,
    discountValue: Number,
    expirationDate: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    price: Number,
    status: String,
    bankAccount: String,
    bankName: String,
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 1,
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
voucherSchema.plugin(mongoose_delete, { overrideMethods: "all" });
const Voucher = mongoose.model("voucher", voucherSchema);
module.exports = Voucher;
