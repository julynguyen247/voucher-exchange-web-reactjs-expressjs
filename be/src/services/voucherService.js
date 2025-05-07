const Voucher = require("../models/voucher");
const User = require("../models/user");
const path = require("path");
const aqp = require("api-query-params");
const uploadImgService = async (image) => {
  if (!image || !image.name) {
    return {
      status: "failed",
      path: null,
      error: "File không tồn tại hoặc không hợp lệ",
    };
  }

  const path = require("path");
  const uploadPath = path.resolve(__dirname, "../public/images/upload");

  const extname = path.extname(image.name);
  const basename = path.basename(image.name, extname);
  const finalName = `${basename}-${Date.now()}${extname}`;
  const finalPath = `${uploadPath}/${finalName}`;

  try {
    await image.mv(finalPath);
    return {
      status: "success",
      path: `/images/upload/${finalName}`,
      error: null,
      name: finalName,
    };
  } catch (error) {
    return {
      status: "failed",
      path: null,
      error: JSON.stringify(error),
    };
  }
};

const createVoucherService = async (
  minimumOrder,
  platform,
  category,
  image,
  code,
  discountValue,
  expirationDate,
  email,
  price,
  bankAccount,
  bankName
) => {
  try {
    let user = await User.findOne({ email: email });
    let userId = user._id;
    let result = await Voucher.create({
      minimumOrder,
      platform,
      category,
      image,
      code,
      discountValue,
      expirationDate,
      createdBy: userId,
      status: "Available",
      price,
      bankAccount,
      bankName,
      rating: 5,
    });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const getVoucherService = async (limit, page, query) => {
  try {
    let result = null;
    if (limit && page) {
      let offset = (page - 1) * limit;
      const { filter } = aqp(query);
      const includeLowRating = query.includeLowRating === "true";
      delete filter.page;
      delete filter.includeLowRating;
      if (!includeLowRating) {
        filter.rating = { ...(filter.rating || {}), $gte: 3 };
      }
      result = await Voucher.find(filter)
        .limit(limit)
        .skip(offset)
        .populate("createdBy")
        .exec();
    } else {
      result = await Voucher.find().populate("createdBy").exec();
    }

    return result;
  } catch (error) {
    console.error("Error in getVoucherService:", error);
    return null;
  }
};

const deleteAVoucherService = async (id) => {
  try {
    let result = await Voucher.deleteById(id);
    return result;
  } catch (error) {
    console.log("error >>>> ", error);
    return null;
  }
};
const rateVoucherService = async (voucherId, rating) => {
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("Rating phải nằm trong khoảng từ 1 đến 5.");
  }

  const voucher = await Voucher.findById(voucherId);
  if (!voucher) {
    throw new Error("Voucher không tồn tại.");
  }

  const total = voucher.totalRatings || 0;
  const currentAvg = voucher.rating || 0;

  const newTotal = total + 1;
  const newAvg = (currentAvg * total + rating) / newTotal;

  voucher.rating = newAvg;
  voucher.totalRatings = newTotal;

  await voucher.save();
  return {
    updatedRating: Math.round(newAvg * 2) / 2,
    totalRatings: newTotal,
  };
};

module.exports = {
  rateVoucherService,
};

module.exports = {
  uploadImgService,
  createVoucherService,
  getVoucherService,
  deleteAVoucherService,
  rateVoucherService,
};
