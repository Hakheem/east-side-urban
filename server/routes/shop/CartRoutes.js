const express = require("express");
const router = express.Router();
const {
  addToCart,
  fetchCartItems,
  updateCartItemsQty,
  deleteCartItem,
  mergeGuestCart,
} = require("../../controllers/shop/CartController");
const { authMiddleware } = require("../../controllers/auth/AuthController");

const sessionMiddleware = (req, res, next) => {
  if (req.user) {
    req.sessionId = req.user.id; 
    return next();
  }
 
  req.sessionId = req.cookies?.guestSessionId || req.sessionID;
  
  if (!req.cookies?.guestSessionId) {
    res.cookie('guestSessionId', req.sessionId, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
  }

  next();
};

router.use(sessionMiddleware); 

router.post("/add",sessionMiddleware, addToCart);

router.put("/update", sessionMiddleware, updateCartItemsQty);
router.delete("/delete/:productId", sessionMiddleware, deleteCartItem);

router.get("/", authMiddleware, fetchCartItems); // For authenticated users
router.get("/guest", sessionMiddleware, fetchCartItems); // For guests
router.post("/merge", authMiddleware, mergeGuestCart);

module.exports = router;