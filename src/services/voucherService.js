const Voucher = require("../models/voucher");
const User=require("../models/user")
const path = require("path");
const uploadImgService = async (image) => {
  let uploadPath = path.resolve(__dirname, "../public/images/upload");
  let extname = path.extname(image.name);
  let basename = path.basename(image.name, extname);
  let finalName = `${basename}-${Date.now()}${extname}`;
  let finalPath = `${uploadPath}/${finalName}`;
  try {
    await image.mv(finalPath);
    return {
      status: "success",
      path: finalPath,
      error: null,
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
  title,
  category,
  image,
  discountValue,
  expirationDate,
  createdBy,
  status
) => {
  try {
    let uploadFile = await uploadImgService(image);
    let result = await Voucher.create({
      title,
      category,
      image: uploadFile.path,
      discountValue,
      expirationDate,
      createdBy,
      status,
    });
    return result;
  } catch (error) {
    return null;
  }
};
const getVoucherService=async()=>{
  const vouchers=await Voucher.find().populate('createdBy').exec();
  return vouchers;
}
const deleteAVoucherService = async (id) => {
  try {
      let result = await Voucher.deleteById(id);
      return result;

  } catch (error) {
      console.log("error >>>> ", error);
      return null;
  }
}
module.exports = { uploadImgService, createVoucherService,getVoucherService,deleteAVoucherService };
