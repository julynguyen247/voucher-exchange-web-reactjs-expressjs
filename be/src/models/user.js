const mongoose = require("mongoose");
const mongoose_delete = require('mongoose-delete');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên là bắt buộc
    email: { type: String, required: false }, // Email không bắt buộc
    password: { type: String, required: false }, // Mật khẩu không bắt buộc (vì Google Login không cần mật khẩu)
    phone: { type: String, required: false }, // Số điện thoại không bắt buộc
    image: { type: String, required: false }, // Ảnh đại diện không bắt buộc
    role: { type: String, default: "user" }, // Vai trò, mặc định là "user"
  },
  { timestamps: true }
);

// Override all methods
userSchema.plugin(mongoose_delete, { overrideMethods: 'all' });

const User = mongoose.model("user", userSchema);
module.exports = User;
