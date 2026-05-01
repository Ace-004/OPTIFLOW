const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");

exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "user already existed" });
    }
    let hash = await bcrypt.hash(password, 12);
    let newUser = await User.create({
      name,
      email,
      password: hash,
      provider: "local",
    });
    const token = generateToken(newUser._id);

    res.cookie('token',token,{
      httpOnly:true,
      secure:false,
      sameSite:"none",
      maxAge:60*60*1000
    })
    res
      .status(201)
      .json({
        success: true,
        message: "user registered",
        data: newUser
      });
  } catch (error) {
    console.log(error.message);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user || user.provider !== "local") {
      return res
        .status(400)
        .json({ success: false, message: "invalid credentials" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    const token = generateToken(user._id);
     res.cookie('token',token,{
      httpOnly:true,
      secure:false,
      sameSite:"none",
      maxAge:60*60*1000
    })
    res.status(200).json({ success: true, message: "successful login"  });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "server error" });
  }
};
