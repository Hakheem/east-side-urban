const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const dotenv = require('dotenv');
dotenv.config();

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
      return res.status(400).json({
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
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 3600000, // 1 hour
      domain: isProduction ? process.env.COOKIE_DOMAIN : undefined
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token, 
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
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.clearCookie("token", {
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  
  res.json({ success: true, message: "Logged out successfully" });
};

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token || 
               req.headers?.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Authentication required" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Ensure consistent user object structure
    req.user = {
      id: decoded.id, 
      email: decoded.email,
      role: decoded.role
    };
    
    // Verify user exists in database
    const userExists = await User.findById(decoded.id);
    if (!userExists) {
      throw new Error("User not found");
    }
    
    console.log('Auth Middleware - Token:', token);
    console.log('Auth Middleware - Decoded:', decoded);
    console.log('Auth Middleware - req.user:', req.user);
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.clearCookie('token');
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };