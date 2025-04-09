const Order = require("../../models/Orders");
const ProductReview = require("../../models/Reviews");
const Product = require("../../models/Products");

const addProductReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } =
      req.body;

    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      orderStatus: "delivered",
    }).select("_id");

    if (!order) {
      return res.status(403).json({
        success: false,
        message:
          "You must purchase and receive this product before reviewing it.",
      });
    }

    const existingReview = await ProductReview.findOne({ productId, userId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue,
    });
    await newReview.save();

    const reviews = await ProductReview.find({ productId });
    const totalReviews = reviews.length;
    const averageReviewsValue =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.reviewValue, 0) /
          totalReviews
        : 0;

    await Product.findByIdAndUpdate(productId, { averageReviewsValue });

    res.status(201).json({
      success: true,
      data: newReview,
      message: "Review added successfully!",
    });
  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getProductReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await ProductReview.find({ productId })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const totalCount = await ProductReview.countDocuments({ productId });

    res.status(200).json({
      success: true,
      data: reviews,
      totalReviews: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

module.exports = { addProductReview, getProductReview };
