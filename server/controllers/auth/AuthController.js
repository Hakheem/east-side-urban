const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');
dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      authProvider: user.authProvider 
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "1h" }
  );
};

// Helper function to set cookie and send response
const sendAuthResponse = (res, user, message) => {
  const token = generateToken(user);
  
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
    message,
    user: {
      email: user.email,
      role: user.role,
      id: user._id,
      userName: user.userName,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      isVerified: user.isVerified,
    },
  });
};

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
      authProvider: 'local',
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error('Registration error:', error);
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

    // Check if user registered with Google
    if (checkUser.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please sign in with Google.",
      });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect. Please try again.",
      });
    }

    sendAuthResponse(res, checkUser, "Login successful");

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Some error occurred while logging in.",
    });
  }
};

// Google Authentication
const googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      success: false,
      message: "Google credential is required",
    });
  }

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    console.log('Google payload:', payload);

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // User exists, update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.isVerified = true;
        if (picture && !user.profilePicture) {
          user.profilePicture = picture;
        }
        await user.save();
      }
      
      sendAuthResponse(res, user, "Login successful");
    } else {
      // Create new user - handle potential username conflicts
      let userName = name || email.split('@')[0];
      
      // Check if username already exists and make it unique
      const existingUser = await User.findOne({ userName });
      if (existingUser) {
        userName = `${userName}_${googleId.slice(-4)}`; // Add last 4 chars of googleId
      }

      const newUser = new User({
        userName: userName,
        email: email,
        googleId: googleId,
        profilePicture: picture,
        authProvider: 'google',
        isVerified: true,
      });

      await newUser.save();
      sendAuthResponse(res, newUser, "Account created and login successful");
    }

  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key errors more gracefully
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `An account with this ${field} already exists.`,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    });
  }
};

// NEW: Check Auth Status - This was missing!
const checkAuthStatus = async (req, res) => {
  try {
    console.log('checkAuthStatus called, req.user:', req.user);
    
    // The authMiddleware already verified the token and set req.user
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User authenticated",
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Check auth status error:', error);
    res.status(401).json({
      success: false,
      message: "Authentication check failed"
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
  const token = req.cookies?.token;
  
  console.log('Auth middleware - cookies:', req.cookies);
  console.log('Auth middleware - token:', token);
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: "Authentication required - no token" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Ensure consistent user object structure
    req.user = {
      id: decoded.id, 
      email: decoded.email,
      role: decoded.role,
      authProvider: decoded.authProvider
    };
    
    // Verify user exists in database
    const userExists = await User.findById(decoded.id);
    if (!userExists) {
      throw new Error("User not found");
    }
    
    console.log('Auth Middleware - req.user set:', req.user);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.clearCookie('token');
    return res.status(401).json({  
      success: false,
      message: "Invalid or expired token" 
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  logoutUser,  
  authMiddleware,
  googleAuth,
  checkAuthStatus, 
};
