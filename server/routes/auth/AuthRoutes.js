const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  googleAuth,
  checkAuthStatus, 
} = require("../../controllers/auth/AuthController");
const router = express.Router();
 
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth); 
router.post("/logout", logoutUser);
 
// Use the proper controller function
router.get("/check-auth", authMiddleware, checkAuthStatus);

module.exports = router;