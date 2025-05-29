const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const aqp = require("api-query-params");

const createUserService = async (name, email, password, phone, image) => {
  try {
    console.log(`Creating user with email: ${email}`);
    
    const user = await User.findOne({ email });
    if (user) {
      console.log(`Email ${email} already exists, please choose another email`);
      return {
        success: false,
        message: "Email already exists"
      };
    } else {
      const hashPassword = await bcrypt.hash(password, saltRounds);
      
      const userData = {
        name,
        email,
        password: hashPassword,
        phone,
        image,
        role: "USER",
      };
      
      console.log("Creating user with data:", JSON.stringify(userData, null, 2));
      
      let result = await User.create(userData);
      console.log("User created successfully with ID:", result._id);
      
      return {
        success: true,
        data: result
      };
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: error.message
    };
  }
};
const loginService = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (user) {
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        return {
          EC: 2,
          EM: "Email/Password khong hop le",
        };
      } else {
        const payload = {
          email: user.email,
          name: user.name,
          id: user._id,
          role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "1d", // Chuỗi hợp lệ
        });
        return {
          EC: 0,
          access_token: token,
          user: {
            email: user.email,
            name: user.name,
            id: user._id,
            role: user.role,
            phone: user.phone || "",
            image: user.image || ""
          },
        };
      }
    } else {
      return {
        EC: 1,
        EM: "Email/Password khong hop le",
      };
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};
const getUserService = async (limit, page, query) => {
  try {
    let result = null;
    if (limit && page) {
      let offset = (page - 1) * limit;
      const { filter } = aqp(query);
      delete filter.page;
      result = await User.find(filter).skip(offset).limit(limit).exec();
    } else {
      result = await User.find({});
    }
    return result;
  } catch (error) {
    return null;
  }
};
const deleteAUserService = async (id) => {
  try {
    let result = await User.deleteById(id);
    return result;
  } catch (error) {
    console.log("error >>>> ", error);
    return null;
  }
};
const updateAUserService = async (
  id,
  name,
  email,
  password,
  phone,
  image,
  accountNumber,
  bank
) => {
  if (password) {
    const hashPassword = await bcrypt.hash(password, saltRounds);
    const result = await User.updateOne(
      { _id: id },
      { name, email, password: hashPassword, phone, image, accountNumber, bank }
    );
    return result;
  } else {
    try {
      const result = await User.updateOne(
        { _id: id },
        { name, email, phone, image, accountNumber, bank }
      );
      return result;
    } catch (error) {
      return null;
    }
  }
};
// Track fetched accounts to avoid repetitive logging
const recentlyFetchedAccounts = new Set();
setInterval(() => recentlyFetchedAccounts.clear(), 60000); // Clear every minute

const fetchAccountService = async (user) => {
  try {
    const userEmail = user.email;
    
    // Only log if we haven't recently seen this account
    if (!recentlyFetchedAccounts.has(userEmail)) {
      console.log("Fetching account for:", userEmail);
      recentlyFetchedAccounts.add(userEmail);
    }
    
    const data = await User.findOne({ email: userEmail }).lean();
    
    if (data && !recentlyFetchedAccounts.has(userEmail + "-found")) {
      console.log("User account found with role:", data.role || "No role");
      recentlyFetchedAccounts.add(userEmail + "-found");
    } else if (!data && !recentlyFetchedAccounts.has(userEmail + "-notfound")) {
      console.log("No user account found for email:", userEmail);
      recentlyFetchedAccounts.add(userEmail + "-notfound");
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchAccountService:", error);
    return null;
  }
};

const rateUserService = async ({ userId, raterId = null, star, ipAddress }) => {
  try {
    if (!star || star < 1 || star > 5) {
      return { success: false, message: "Số sao phải từ 1 đến 5" };
    }

    if (!userId) {
      return { success: false, message: "Thiếu userId cần được đánh giá" };
    }

    // Kiểm tra xem có ít nhất một định danh
    if (!raterId && !ipAddress) {
      return { success: false, message: "Thiếu thông tin người đánh giá hoặc IP" };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, message: "Người dùng không tồn tại" };
    }

    // Không cho tự đánh giá chính mình nếu có raterId
    if (raterId && userId === raterId.toString()) {
      return { success: false, message: "Không thể tự đánh giá chính mình" };
    }

    // Use the model's method
    await user.addRating(raterId, star, ipAddress);

    return {
      success: true,
      message: "Đánh giá thành công",
      data: {
        ratingAvg: user.ratingAvg,
        ratingCount: user.ratingCount
      }
    };
  } catch (error) {
    console.error("Rating error:", error);
    return {
      success: false,
      message: "Lỗi hệ thống",
    };
  }
};


module.exports = {
  createUserService,
  loginService,
  getUserService,
  deleteAUserService,
  updateAUserService,
  fetchAccountService,
  rateUserService,
};
