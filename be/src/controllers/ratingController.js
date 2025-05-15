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

    res.json({
      msg: "Đánh giá thành công",
      ratingAvg: targetUser.ratingAvg.toFixed(2),
      ratingCount: targetUser.ratingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi máy chủ");
  }
}

module.exports = {rating};