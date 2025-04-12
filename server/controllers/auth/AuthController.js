const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// Register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields",
    });
  }

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const hashPassword = await bcrypt.hash(password, 14);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Some error occurred while registering the user.",
    });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist. Kindly register then try again.",
      });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect. Please try again.",
      });
    }

    const token = jwt.sign(
      { id: checkUser._id, email: checkUser.email, role: checkUser.role },
      "CLIENT_SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Some error occurred while logging in.",
    });
  }
};

// Logout
const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Please login to access.",
    });
  }

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    res.status(401).json({
      success: false,
      message: "Unauthorized user. Kindly login.",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
