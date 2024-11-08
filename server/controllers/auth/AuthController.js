const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// Register User
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with the email" }); 
    }

    const hashedPassword = await bcrypt.hash(password, 14);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful" }); 
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        message: "User doesn't exist. Kindly register then try again",
      });

    const isMatch = await bcrypt.compare(password, checkUser.password);
    if (!isMatch) return res.json({ message: "Password is incorrect" });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httoOnly: true, secure: false }).json({
      message: "Logged in successfully.",
      user: {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occured" });
  }
};

module.exports = { registerUser, loginUser };
