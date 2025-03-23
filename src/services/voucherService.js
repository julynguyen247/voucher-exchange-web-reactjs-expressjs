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
      name:finalName
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
  code,
  image,
  discountValue,
  expirationDate,
  email,
  status,
  price
) => {
  try {
    let user = await User.findOne({ email: email });
    let userId = user._id;
    let uploadFile = await uploadImgService(image);
    let result = await Voucher.create({
      minimumOrder,
      platform,
      category,
      code,
      image: uploadFile.path,
      discountValue,
      expirationDate,
      createdBy: userId,
      status,
      price,
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
      delete filter.page;
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
module.exports = {
  uploadImgService,
  createVoucherService,
  getVoucherService,
  deleteAVoucherService,
};
