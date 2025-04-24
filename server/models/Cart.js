const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Now optional for guests
    },
    sessionId: {
      type: String,
      required: false, // For guest carts
      index: true, // Faster queries
    },
    items: [
      { 
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        }, 
      },
    ], 
  },
  {
    timestamps: true,
  }
);

// Compound index for faster lookups
CartSchema.index({ userId: 1, sessionId: 1 });

module.exports = mongoose.model("Cart", CartSchema);