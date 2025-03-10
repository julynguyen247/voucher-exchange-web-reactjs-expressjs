const User = require("../models/user");
const {
  uploadImgService,
  createVoucherService,getVoucherService,
  deleteAVoucherService
} = require("../services/voucherService");
const createVoucher = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });
  const userId = user._id;
  const { title, category, discountValue, expirationDate, status } = req.body;
  const img = req.files.img;
  const result = await createVoucherService(
    title,
    category,
    img,
    discountValue,
    expirationDate,
    userId,
    status
  );
  return res.status(200).json({
    message: "Success",
    voucher: result,
  });
};
const handleUploadImg = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let result = await uploadImgService(req.files.image);

  return res.status(200).json({
    data: result,
  });
};
const getVoucher=async (req,res)=>{
    let result=await getVoucherService();
    return res.status(200).json({
        data: result,
      });
}
const deleteVoucher = async (req, res) => {
  let id = req.body.id;
  let result = await deleteAVoucherService(id);
  return res.status(200).json(
    {
        EC: 0,
        data: result
    }
) 
};
module.exports = { handleUploadImg, createVoucher,getVoucher,deleteVoucher };
