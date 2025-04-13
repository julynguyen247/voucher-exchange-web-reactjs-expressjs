const jwt = require("jsonwebtoken");

const createJWT = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED || "1d",
  });
};

module.exports = { createJWT };