const express = require("express");

const {
  addToCart,
  fetchCartItems,
  updateCartItemsQty,
  deleteCartItem,
} = require("../../controllers/shop/CartController");
 
const router = express.Router();

router.post("/add", addToCart); 
router.get("/get/:userId", fetchCartItems); 
router.put("/update-cart", updateCartItemsQty); 
router.delete("/delete/:userId/:productId", deleteCartItem); 

module.exports = router;