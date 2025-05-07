const Favorite = require("../models/favorite");

const addFavoriteService = async (userId, voucherId) => {
  const exists = await Favorite.findOne({ user: userId, voucher: voucherId });
  if (exists) throw new Error("Đã yêu thích trước đó.");

  return await Favorite.create({ user: userId, voucher: voucherId });
};

const removeFavoriteService = async (userId, voucherId) => {
  return await Favorite.delete({ user: userId, voucher: voucherId });
};

const getUserFavoritesService = async (userId) => {
  return await Favorite.find({ user: userId })
    .populate("voucher")
    .sort({ createdAt: -1 });
};

module.exports = {
  addFavoriteService,
  removeFavoriteService,
  getUserFavoritesService,
};
