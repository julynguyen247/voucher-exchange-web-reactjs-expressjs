const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "voucher",
      required: true,
    },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, voucher: 1 }, { unique: true });

favoriteSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const Favorite = mongoose.model("favorite", favoriteSchema);
module.exports = Favorite;
