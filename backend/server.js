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
// Behind a hosting proxy (Render, Railway, ...) req.ip is the proxy unless this is set,
// which would put every user in the same rate-limit bucket.
app.set("trust proxy", 1);
// security headers
app.use(helmet());
// rate limiting
app.use(
  ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

// Only the configured frontend origin(s) may make credentialed requests.
// FRONTEND_URL can be a comma-separated list.
const allowedOrigins = [
  ...(process.env.FRONTEND_URL || "").split(","),
  ...(process.env.CUSTOM_DOMAIN || "").split(","),
  "http://localhost:3000",
  "http://localhost:5173",
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});
// stricter limit on login/register than the global one
const authLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "too many attempts, try again later" },
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", protect, taskRoutes);

app.get("/me", protect, (req, res, next) => {
  res.json({ userId: req.user });
});

app.use("/health", async (req, res) => {
  res.json({ status: "ok" });
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
