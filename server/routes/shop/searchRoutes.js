const express = require("express");
const { searchProducts } = require("../../controllers/shop/SearchController");
const router = express.Router();

// You could also support query parameter searches
router.get(["/:keyword", "/"], searchProducts);

module.exports = router;