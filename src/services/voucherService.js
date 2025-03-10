const Voucher=require('../models/voucher')
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
const createVoucherService=async(title,category,image,discountValue,expirationDate,createdBy,status)=>{
  try {
    let uploadFile=await uploadImgService(image);
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
    console.log(error)
  }

}
module.exports = { uploadImgService,createVoucherService };
