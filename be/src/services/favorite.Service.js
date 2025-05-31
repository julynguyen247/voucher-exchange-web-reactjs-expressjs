const { default: mongoose } = require("mongoose");
const Favorite = require("../models/favorite");

const addFavoriteService = async (userId, voucherId) => {
  const exists = await Favorite.findOne({ user: userId, voucher: voucherId });
  if (exists) throw new Error("Đã yêu thích trước đó.");

  return await Favorite.create({ user: userId, voucher: voucherId });
};

const removeFavoriteService = async (userId, voucherId) => {
  return await Favorite.deleteOne({ user: userId, voucher: voucherId });
};

const getUserFavoritesService = async (userId) => {
  return Favorite.find({ user: new mongoose.Types.ObjectId(userId) }).populate(
    "voucher"
  );
};

module.exports = {
  addFavoriteService,
  removeFavoriteService,
  getUserFavoritesService,
};
