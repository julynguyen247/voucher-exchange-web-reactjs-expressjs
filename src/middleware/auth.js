const jwt = require("jsonwebtoken");
require("dotenv").config();
const auth = (req, res, next) => {
  const white_lists = ["/login", "/register", "/"];
  if (white_lists.find((item) => "/v1/api" + item === req.originalUrl)) {
    next();
  } else {
    if (req.header && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };
        next();
      } catch (error) {
        return res.status(401).json({
            message: "Token hết hạn hoặc token không hợp lệ ",
          });
      }
    } else {
        return res.status(401).json({
            message: "Bạn chưa truyền token hoặc token không hợp lệ ",
          });
    }
  }
};
module.exports = auth;
