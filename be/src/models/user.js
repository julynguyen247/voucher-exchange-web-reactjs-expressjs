const mongoose = require("mongoose");
const mongoose_delete = require('mongoose-delete');
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
  },
  { timestamps: true }
);
// Override all methods
userSchema.plugin(mongoose_delete,{ overrideMethods: 'all' });


const User = mongoose.model("user", userSchema);
module.exports = User;
