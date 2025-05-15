const mongoose = require("mongoose");
const User = require("../models/user");

const rating = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ msg: "Người dùng không tồn tại" });

    const { star } = req.body;
    if (!star || star < 1 || star > 5)
      return res.status(400).json({ msg: "Số sao phải từ 1 đến 5" });

    if (targetUser._id.equals(req.user._id)) {
      return res.status(403).json({ msg: "Bạn không thể đánh giá chính mình" });
    }

    await targetUser.addRating(req.user._id, star);

    const updatedUser = await User.findById(req.params.id);

    res.json({
      msg: "Đánh giá thành công",
      ratingAvg: updatedUser.ratingAvg.toFixed(2),
      ratingCount: updatedUser.ratingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi máy chủ");
  }
}

const getUsersWithRatings = async (req, res) => {
  try {
    const users = await User.find({}, "name email ratingAvg ratingCount").sort({ ratingAvg: -1, ratingCount: -1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Lỗi máy chủ" });
  }
};

module.exports = {rating, getUsersWithRatings};