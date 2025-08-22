const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      salePrice: String,
      quantity: Number,
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    zipcode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: {
    type: String,
    default: "pending",
  },
  totalAmount: Number,
  orderDate: {
    type: Date,
    default: Date.now,
  },
  orderUpdateDate: {
    type: Date,
    default: Date.now,
  },
  paymentId: String,
  payerId: String,
  // Paystack specific fields
  paymentReference: {
    type: String,
    required: false,
  },
  paystackAuthorizationUrl: String,
  currency: {
    type: String,
    default: "KES",
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: Date,
});

// Update orderUpdateDate before saving
OrderSchema.pre("save", function (next) {
  this.orderUpdateDate = Date.now();
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
