const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");
const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // BẮT BUỘC phải có
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("http://localhost:5173/login-failed?reason=no-email");
    }

    const user = req.user;
    res.redirect(`http://localhost:5173/login-success?email=${user.email}&name=${user.name}`);
  }
);

router.post("/google-login", authController.handleGoogleLogin);

module.exports = router;
