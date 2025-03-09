const User = require("../models/user");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const createUserService = async (name, email, password) => {
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
      const compare = bcrypt.compare(password, user.password);
      if (!compare) {
        return {
          EC: 2,
          EM: "Email/Password khong hop le",
        };
      } else {
        const payload = {
          email: user.email,
          password: user.password,
        };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRED,
        });
        return {
          EC: 0,
          access_token,
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
const getUserService=async ()=>{
  const data= await User.find();
  return data;
};
module.exports = { createUserService,loginService,getUserService };
