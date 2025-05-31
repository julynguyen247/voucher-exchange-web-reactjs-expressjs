const {
  uploadImgService,
  createVoucherService,
  getVoucherService,
  deleteAVoucherService,
  rateVoucherService,
} = require("../services/voucherService");
const Voucher = require("../models/voucher");
const User = require("../models/user");
const createVoucher = async (req, res) => {
  try {
    const {
      minimumOrder,
      category,
      discountValue,
      expirationDate,
      platform,
      code,
      price,
      image,
      email,
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
      email,
      price,
      bankAccount,
      bankName
    );
    return res.status(200).json({
      EC: 0,
      message: "Success",
      voucher: result,
    });
  } catch (error) {
    console.error("Error creating voucher:", error);
    return res.status(500).json({
      EC: 1,
      message: "Failed to create voucher",
      error: error.message,
    });
  }
};
const handleUploadImg = async (req, res) => {
  try {
    const image = req.files?.file;

    if (!image) {
      return res.status(400).json({
        EC: 1,
        message: "No file uploaded!",
      });
    }

    console.log(
      `Attempting to save image to: ${process.cwd()}/src/public/images/upload/${
        image.name
      }`
    );

    // Log file information for debugging
    console.log("Uploading file:", {
      name: image.name,
      size: image.size,
      mimetype: image.mimetype,
    });

    const result = await uploadImgService(image);

    if (result.status === "success") {
      // Get the server's base URL from environment or construct a default
      const port = process.env.PORT || 8081;
      const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;

      // Ensure the path starts with a slash for URL construction
      const path = result.path.startsWith("/")
        ? result.path
        : `/${result.path}`;
      const url = `${baseUrl}${path}`;

      console.log("Upload successful, image URL:", url);

      return res.json({
        EC: 0,
        message: "Tải ảnh lên thành công",
        url: url,
        path: path,
      });
    } else {
      console.error("Upload failed:", result.error);
      return res.status(500).json({
        EC: 1,
        message: "Không thể tải ảnh lên",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    return res.status(500).json({
      EC: 1,
      message: "Server error during file upload",
      error: error.message,
    });
  }
};

const getVoucher = async (req, res) => {
  try {
    let limit = req.query.limit;
    let page = req.query.page;
    let result = null;
    if (limit && page) {
      result = await getVoucherService(limit, page, req.query);
    } else {
      result = await getVoucherService();
    }

    return res.status(200).json({
      EC: 0,
      message: "Success",
      data: {
        vouchers: result,
        total: result.length,
      },
    });
  } catch (error) {
    console.error("Error getting vouchers:", error);
    return res.status(500).json({
      EC: 1,
      message: "Failed to get vouchers",
      error: error.message,
    });
  }
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
const rateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const result = await rateVoucherService(id, rating);
    return res.status(200).json({
      message: "Đánh giá thành công.",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports = {
  handleUploadImg,
  createVoucher,
  getVoucher,
  deleteVoucher,
  getPlatform,
  getCategory,
  rateVoucher,
};
