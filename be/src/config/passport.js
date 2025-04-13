const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8081/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Kiểm tra email
        const email = profile.emails && profile.emails[0]?.value ? profile.emails[0].value : null;

        // Nếu không có email, xử lý logic khác (ví dụ: tạo email mặc định)
        if (!email) {
          return done(null, false, { message: "Email không tồn tại trong tài khoản Google" });
        }

        // Lưu thông tin người dùng vào database
        const user = await User.findOrCreate({
          googleId: profile.id,
          name: profile.displayName,
          email: email, // Sử dụng email từ Google hoặc giá trị mặc định
        });
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
