const {
  addFavoriteService,
  removeFavoriteService,
  getUserFavoritesService,
} = require("../services/favorite.Service");

const addFavorite = async (req, res) => {
  const { userId, voucherId } = req.body;
  try {
    const favorite = await addFavoriteService(userId, voucherId);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  const { userId, voucherId } = req.body;
  try {
    const result = await removeFavoriteService(userId, voucherId);
    res.json({ message: "Đã xoá khỏi yêu thích.", result });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xoá yêu thích.", error });
  }
};

const getUserFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const favorites = await getUserFavoritesService(userId);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách yêu thích.", error });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
};
