const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");

const ratingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: false },
  ipAddress: { type: String }, // Hoặc email ẩn danh
  star: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

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
    ratings: [ratingSchema],
    ratingCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Override all methods
userSchema.plugin(mongoose_delete, { overrideMethods: "all" });

// Method: Add or update rating
userSchema.methods.addRating = async function (raterId, star, ipAddress) {
  if (!star || star < 1 || star > 5) {
    throw new Error("Star must be between 1 and 5");
  }

  // Kiểm tra xem ít nhất một định danh được cung cấp
  if (!raterId && !ipAddress) {
    throw new Error("Either raterId or ipAddress must be provided");
  }

  let existingRating;

  if (raterId) {
    existingRating = this.ratings.find(r => r.rater && r.rater.equals(raterId));
  } else if (ipAddress) {
    existingRating = this.ratings.find(r => r.ipAddress === ipAddress);
  }

  if (existingRating) {
    existingRating.star = star;
    existingRating.createdAt = Date.now();
  } else {
    this.ratings.push({ 
      rater: raterId || undefined, 
      ipAddress: ipAddress || undefined, 
      star 
    });
  }

  // Recalculate average
  this.ratingCount = this.ratings.length;
  const total = this.ratings.reduce((sum, r) => sum + r.star, 0);
  this.ratingAvg = total / this.ratings.length;

  return this.save();
};

// Thêm các index này để cải thiện hiệu suất truy vấn
userSchema.index({ ratingAvg: -1, ratingCount: -1 });

const User = mongoose.model("user", userSchema);
module.exports = User;
