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
  const fs = require("fs");

  // Ensure upload directory exists
  const uploadPath = path.resolve(__dirname, "../public/images/upload");
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`Created directory: ${uploadPath}`);
  }

  const extname = path.extname(image.name);
  const basename = path.basename(image.name, extname);
  const finalName = `${basename}-${Date.now()}${extname}`;
  const finalPath = `${uploadPath}/${finalName}`;

  try {
    // Log the path where we're trying to save the file
    console.log(`Attempting to save image to: ${finalPath}`);

    // Move the file to the upload directory
    await image.mv(finalPath);

    // Check if the file was successfully saved
    const fs = require("fs");
    if (fs.existsSync(finalPath)) {
      console.log(`File successfully saved to: ${finalPath}`);
      return {
        status: "success",
        path: `/images/upload/${finalName}`,
        error: null,
        name: finalName,
      };
    } else {
      console.error(`File was not saved to ${finalPath}`);
      return {
        status: "failed",
        path: null,
        error:
          "File move operation completed but file does not exist at destination",
      };
    }
  } catch (error) {
    console.error(`Error saving file to ${finalPath}:`, error);
    return {
      status: "failed",
      path: null,
      error: error.message || JSON.stringify(error),
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
    console.log("Creating voucher with params:", {
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
      bankName,
    });

    // Find user by email, or use admin account if specified
    let userId = null;
    let user = null;

    if (email) {
      console.log(`Looking for user with email: ${email}`);
      user = await User.findOne({ email: email });

      if (user) {
        console.log(`Found user with email ${email}:`, user._id);
        userId = user._id;
      } else if (email === "admin@voucher-exchange.com") {
        // Try to find an admin user
        console.log("Looking for admin user");
        const adminUser = await User.findOne({ role: "ADMIN" });
        if (adminUser) {
          console.log("Using admin user:", adminUser._id);
          userId = adminUser._id;
        } else {
          console.log(
            "No admin user found, creating voucher without user association"
          );
        }
      } else {
        console.log(`No user found with email ${email}`);
      }
    } else {
      console.log("No email provided");
    }

    // Format the date correctly
    let formattedDate;
    try {
      if (typeof expirationDate === "string") {
        formattedDate = new Date(expirationDate);
      } else {
        formattedDate = expirationDate;
      }

      // Check if date is valid
      if (isNaN(formattedDate.getTime())) {
        console.error("Invalid date format:", expirationDate);
        formattedDate = new Date(); // Default to current date
        formattedDate.setMonth(formattedDate.getMonth() + 1); // Set to 1 month from now
      }
    } catch (dateError) {
      console.error("Error parsing date:", dateError);
      formattedDate = new Date();
      formattedDate.setMonth(formattedDate.getMonth() + 1); // Set to 1 month from now
    }

    // Prepare voucher data
    const voucherData = {
      minimumOrder: Number(minimumOrder) || 0,
      platform: platform || "Unknown",
      category: category || "Other",
      image: image || "",
      code: code || "",
      discountValue: Number(discountValue) || 0,
      expirationDate: formattedDate,
      status: "Available",
      price: Number(price) || 0,
      rating: 5,
      totalRatings: 1,
    };

    // Only add user-specific fields if a user was found
    if (userId) {
      voucherData.createdBy = userId;
    }

    if (bankAccount) voucherData.bankAccount = bankAccount;
    if (bankName) voucherData.bankName = bankName;

    console.log("Creating voucher with data:", voucherData);

    // Wrap the creation in a try-catch block to provide detailed error info
    try {
      // Create the voucher with strict validation
      console.log(
        "Creating voucher with final data:",
        JSON.stringify(voucherData, null, 2)
      );
      let result = await Voucher.create(voucherData);
      console.log("Voucher created successfully with ID:", result._id);

      // Verify the voucher was created by retrieving it
      const verified = await Voucher.findById(result._id);
      if (!verified) {
        console.error(
          "Failed to verify voucher creation, voucher not found after creation"
        );
      } else {
        console.log("Voucher creation verified successfully");
      }

      return result;
    } catch (dbError) {
      console.error("Database error creating voucher:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error("Error creating voucher:", error);
    throw error; // Re-throw to handle in the controller
  }
};
const getVoucherService = async (limit, page, query) => {
  try {
    let result = null;
    if (limit && page) {
      let offset = (page - 1) * limit;

      // Parse query parameters safely
      const { filter = {} } = query ? aqp(query) : { filter: {} };

      // voucher condition
      filter.deleted = { $ne: true };

      // Handle special query parameters
      if (query) {
        const includeLowRating = query.includeLowRating === "true";

        // Remove pagination params from filter
        delete filter.page;
        delete filter.limit;
        delete filter.admin;
        delete filter.includeLowRating;

        // Apply rating filter unless explicitly including low ratings
        if (!includeLowRating) {
          filter.rating = { ...(filter.rating || {}), $gte: 3 };
        }

        // Add search query if present
        if (query.q) {
          const searchRegex = new RegExp(query.q, "i");
          filter.$or = [
            { code: searchRegex },
            { platform: searchRegex },
            { category: searchRegex },
          ];
        }
      }

      console.log("Voucher query filter:", filter);

      result = await Voucher.find(filter)
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(parseInt(limit))
        .skip(offset)
        .populate("createdBy")
        .exec();
    } else {
      result = await Voucher.find()
        .sort({ createdAt: -1 })
        .populate("createdBy")
        .exec();
    }

    return result;
  } catch (error) {
    console.error("Error in getVoucherService:", error);
    return [];
  }
};

const deleteAVoucherService = async (id) => {
  try {
    let result = await Voucher.findByIdAndDelete(id);
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
  uploadImgService,
  createVoucherService,
  getVoucherService,
  deleteAVoucherService,
  rateVoucherService,
};
