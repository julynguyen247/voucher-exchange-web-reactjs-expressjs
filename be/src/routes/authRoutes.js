const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController"); // Import controller
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const user = req.user;
    res.redirect(`http://localhost:3000?email=${user.emails[0].value}&name=${user.displayName}`);
  }
);

// Route xử lý Google Login từ frontend
router.post("/google-login", authController.handleGoogleLogin);

module.exports = router;
