const express = require("express");
const apiRoutes = require("./routes/api");
const connection = require("./config/database");
require("dotenv").config();

const cors = require("cors");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT || 8888;
const hostname = process.env.HOST_NAME || "127.0.0.1";

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(helmet());

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    responseOnLimit: "File size exceeds the allowed limit!",
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later!",
});
app.use(limiter);

app.use(morgan("combined"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/v1/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((err, req, res, next) => {
  console.error("An error occurred:", err.message);
  res.status(500).json({ error: "Internal Server Error!" });
});

(async () => {
  try {
    await connection();

    app.listen(port, hostname, () => {
      console.log(`Server is running at http://${hostname}:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
})();
