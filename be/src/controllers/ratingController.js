const mongoose = require("mongoose");
const User = require("../models/user");
const { rateUserService } = require("../services/userService");

const rating = async (req, res) => {
  try {
    const userId = req.params.id;
    const raterId = req.user ? req.user._id : null;
    const { star } = req.body;
    const ipAddress = req.ip;

    const result = await rateUserService({ userId, raterId, star, ipAddress });
    
    if (!result.success) {
      return res.status(400).json({ msg: result.message });
    }
    
    res.json(successResponse("Đánh giá thành công", result.data));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse("Lỗi máy chủ", "SERVER_ERROR"));
  }
};

const getUsersWithRatings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { ratingAvg: -1, ratingCount: -1 }
    };
    
    const users = await User.find(
      {},
      "name email ratingAvg ratingCount"
    )
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .sort(options.sort);
    
    const total = await User.countDocuments({});
    
    res.json(successResponse("Danh sách người dùng theo đánh giá", { 
      users,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit)
      }
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json(errorResponse("Lỗi máy chủ", "SERVER_ERROR"));
  }
};

module.exports = { rating, getUsersWithRatings };
