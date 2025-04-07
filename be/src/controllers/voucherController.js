const {
  uploadImgService,
  createVoucherService,
  getVoucherService,
  deleteAVoucherService,
} = require("../services/voucherService");
const Voucher = require("../models/voucher");
const User = require("../models/user");
const createVoucher = async (req, res) => {
  const {
    minimumOrder,
    category,
    discountValue,
    expirationDate,
    platform,
    code,
    price,
    image,
    bankAccount,
    bankName,
  } = req.body;

  const result = await createVoucherService(
    minimumOrder,
    platform,
    category,
    image,
    code,
    discountValue,
    expirationDate,
    req.user.email,
    price,
    bankAccount,
    bankName
  );
  return res.status(200).json({
    message: "Success",
    voucher: result,
  });
};
const handleUploadImg = async (req, res) => {
  const image = req.files?.file;

  if (!image) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  const result = await uploadImgService(image);
  return res.json(result);
};

const getVoucher = async (req, res) => {
  let limit = req.query.limit;
  let page = req.query.page;
  let result = null;
  if (limit && page) result = await getVoucherService(limit, page, req.query);
  else {
    result = await getVoucherService();
  }
  return res.status(200).json({
    data: result,
  });
};
const deleteVoucher = async (req, res) => {
  let id = req.body.id;
  let result = await deleteAVoucherService(id);
  return res.status(200).json({
    EC: 0,
    data: result,
  });
};
const getPlatform = async (req, res) => {
  let data = [
    "Shopee",
    "Lazada",
    "Sendo",
    "Tiki",
    "Tiktok Shop",
    "Amazon",
    "eBay",
  ];
  return res.status(200).json({
    EC: 0,
    data: data,
  });
};
const getCategory = async (req, res) => {
  let data = [
    "Food & Drinks",
    "Fashion & Jewelry",
    "Beauty & Health",
    "Electronics",
    "Home & Living",
    "Travel & Entertainment",
    "Baby & Kids",
  ];
  return res.status(200).json({
    EC: 0,
    data: data,
  });
};
module.exports = {
  handleUploadImg,
  createVoucher,
  getVoucher,
  deleteVoucher,
  getPlatform,
  getCategory,
};
