const express = require("express");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const app = express();
const port = process.env.PORT || 8888;
const hostname = process.env.HOST_NAME;
const compression = require("compression");
const sharp = require("sharp");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

//config cors
app.use(cors());
//config file upload
app.use(fileUpload());
//config req.body
app.use(express.json()); // for json
app.use(express.urlencoded({ extended: true })); // for form data

// Add security headers
//app.use(helmet());

// Enable gzip compression
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/v1/api", limiter);

app.use(
  "/images",
  express.static(path.join(__dirname, "public/images"), {
    maxAge: "1y", // Cache for 1 year
    etag: false,
  })
);

app.use("/v1/api", apiRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

(async () => {
  try {
    //using mongoose
    await connection();

    app.listen(port, hostname, () => {
      console.log(`Backend Nodejs App listening on port ${port}`);
    });
  } catch (error) {
    console.log(">>> Error connect to DB: ", error);
  }
})();
