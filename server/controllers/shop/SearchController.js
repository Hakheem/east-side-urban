// SearchController.js
const Product = require("../../models/Products");

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    
    if (!keyword || typeof keyword !== "string" || keyword.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid search term (at least 3 characters)",
      });
    }

    const regex = new RegExp(keyword, "i"); // Fixed RegExp

    const results = await Product.find({
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
        { brand: regex },
        { tags: regex },
      ],
    });

    res.status(200).json({
      success: true,
      count: results.length,
      products: results, // Changed from 'data' to 'products'
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during search",
    });
  }
};

module.exports = { searchProducts };