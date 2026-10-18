const User = require("../models/user");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { generateToken } = require("../utils/generateToken");

const isProd = process.env.NODE_ENV === "production";

// One definition, so clearing the cookie on logout always matches how it was set.
const cookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  // 'none' in production because the frontend is on a different site; 'lax' locally
  sameSite: isProd ? "none" : "lax",
  path: "/",
});

const emailSchema = z.string().trim().toLowerCase().email();

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

exports.register = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "name, a valid email and a password of at least 8 characters are required",
    });
  }
  const { name, email, password } = parsed.data;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "user already existed" });
    }
    const hash = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hash,
      provider: "local",
    });
    const token = generateToken(newUser._id);

    res.cookie("token", token, { ...cookieOptions(), maxAge: 60 * 60 * 1000 });
    // never send the user document back: it contains the password hash
    res.status(201).json({
      success: true,
      message: "user registered",
      data: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    // two simultaneous registrations for one email: the unique index rejects the second
    if (error && error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "user already existed" });
    }
    console.log(error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ success: false, message: "invalid credentials" });
  }
  const { email, password } = parsed.data;

  try {
    const user = await User.findOne({ email });
    if (!user || user.provider !== "local") {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }
    const token = generateToken(user._id);

    res.cookie("token", token, { ...cookieOptions(), maxAge: 60 * 60 * 1000 });
    res.status(200).json({ success: true, message: "successful login" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token", cookieOptions());
  res.status(200).json({ success: true, message: "logged out" });
};
