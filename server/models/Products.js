const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  image: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number }, 
  totalStock: { type: Number, default: 1 },  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);