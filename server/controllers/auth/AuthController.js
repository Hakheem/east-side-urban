const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");



// register
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
        message: "User already exists",
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
      message: "Some error occurred",
    });
  }
};


// Login User 
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist. Kindly register then try again."
      });
    }

    const checkPassword = await bcrypt.compare(password, checkUser.password);
    if (!checkPassword) {
      return res.status(401).json({
        
        
success: false,
        message: "Password is incorrect. Please try again."
      });
    }

    // Return a success response without JWT for now
    res.status(200).json({
      success: true,
      
  
message: "Login successful",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
      }
    });
  } 
      
catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};


module.exports = { registerUser, loginUser };
