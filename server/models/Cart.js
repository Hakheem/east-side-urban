const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
      sessionId: { 
    type: String,
    required: false,
    index: true,
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
        title: {
          type: String,
          required: true, 
        },
        price: {
          type: Number,
          required: true,
        },
        salePrice: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        totalStock: {
          type: Number,
          required: true, 
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
