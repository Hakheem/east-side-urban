const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../../controllers/auth/AuthController");
const {
  addToCart,
  fetchCartItems,
  updateCartItemsQty,
  deleteCartItem,
  mergeGuestCart,
} = require("../../controllers/shop/CartController");

router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/get/me", fetchCartItems);
router.put("/update-cart", updateCartItemsQty);
router.delete("/delete/me/:productId", deleteCartItem);
router.post("/merge", mergeGuestCart); 

module.exports = router;