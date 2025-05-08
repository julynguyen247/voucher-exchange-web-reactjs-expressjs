const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const aqp = require("api-query-params");

const createUserService = async (name, email, password, phone, image) => {
  try {
    const user = await User.findOne({ email });
    if (user) {
      console.log(`chon email khac ${email}`);
      return null;
    } else {
      const hashPassword = await bcrypt.hash(password, saltRounds);
      let result = await User.create({
        name,
        email,
        password: hashPassword,
        phone,
        image,
        role: "USER",
      });
      return result;
    }
  } catch (error) {
    console.log(error);
    return null;
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
const fetchAccountService = async (user) => {
  const data = await User.findOne({ email: user.email }).lean();

  return data;
};
module.exports = {
  createUserService,
  loginService,
  getUserService,
  deleteAUserService,
  updateAUserService,
  fetchAccountService,
};
