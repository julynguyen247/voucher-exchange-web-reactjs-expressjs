const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    password: { type: String, required: false },
    phone: { type: String, required: false },
    image: { type: String, required: false },
    accountNumber: String,
    bank: String,
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

// Override all methods
userSchema.plugin(mongoose_delete, { overrideMethods: "all" });

const User = mongoose.model("user", userSchema);
module.exports = User;
