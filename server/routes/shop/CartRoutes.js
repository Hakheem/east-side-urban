const express = require("express");
const router = express.Router();
const {
  addToCart,
  fetchCartItems,
  updateCartItemsQty,
  deleteCartItem,
  clearCart,
  mergeGuestCart,
} = require("../../controllers/shop/CartController");
const { authMiddleware } = require("../../controllers/auth/AuthController");

// Session middleware (for guests)
const sessionMiddleware = (req, res, next) => {
  if (req.user) {
    // Authenticated user
    return next();
  }

  req.sessionId = req.cookies?.guestSessionId || req.sessionID;

  if (!req.cookies?.guestSessionId) {
    res.cookie("guestSessionId", req.sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }

  next();
};

// 🔹 AUTHENTICATED USERS ROUTES
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateCartItemsQty);
router.delete("/delete/:productId", authMiddleware, deleteCartItem);
router.delete("/clear", authMiddleware, clearCart); // Add clearCart route
router.get("/", authMiddleware, fetchCartItems);
router.post("/merge", authMiddleware, mergeGuestCart);

// 🔹 GUEST ROUTES
router.get("/guest", sessionMiddleware, fetchCartItems);
router.post("/guest/add", sessionMiddleware, addToCart);
router.put("/guest/update", sessionMiddleware, updateCartItemsQty);
router.delete("/guest/delete/:productId", sessionMiddleware, deleteCartItem);
router.delete("/guest/clear", sessionMiddleware, clearCart); // Add clearCart for guests too

module.exports = router;
