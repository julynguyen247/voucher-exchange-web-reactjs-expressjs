const {
  addFavoriteService,
  removeFavoriteService,
  getUserFavoritesService,
} = require("../services/favorite.Service");

const addFavorite = async (req, res) => {
  const { userId, voucherId } = req.body;

  try {
    const favorite = await addFavoriteService(userId, voucherId);
    res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách yêu thích.",
      data: favorite,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi thêm yêu thích.",
    });
  }
};

const removeFavorite = async (req, res) => {
  const { userId, voucherId } = req.body;

  try {
    const result = await removeFavoriteService(userId, voucherId);
    res.status(200).json({
      success: true,
      message: "Đã xoá khỏi danh sách yêu thích.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xoá khỏi yêu thích.",
      error: error.message,
    });
  }
};

const getUserFavorites = async (req, res) => {
  const { userId } = req.params;

  try {
    const favorites = await getUserFavoritesService(userId);
    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách yêu thích.",
      error: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
};
