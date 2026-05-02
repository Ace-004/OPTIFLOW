const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/task");
const protect = require("./middleware/authMiddleware");
const helmet = require("helmet");
const ratelimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const app = express();
// security headers
app.use(helmet());
// rate limiting
app.use(
  ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// During development allow requests from the frontend dev server and echo origin
// so the Access-Control-Allow-Origin header is present on responses.
app.use(
  cors({
    origin: true, // reflect request origin
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/auth", authRoutes);
app.use("/api", protect, taskRoutes);

app.get("/me", protect, (req, res, next) => {
  res.json({ userId: req.user });
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, () => {
      console.log(`http://localhost:5000`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
