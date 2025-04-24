const express = require("express");
const { getFilteredProducts, productDetails } = require("../../controllers/shop/ShopProductsController");

const router = express.Router();

router.get("/fetch", getFilteredProducts);
router.get("/get/:id", productDetails);

module.exports = router;
 