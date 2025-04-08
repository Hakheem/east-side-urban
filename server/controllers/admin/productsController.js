const { imageUpload } = require("../../config/cloudinary");
const Product = require("../../models/Products");

// image upload
const handleImageUpload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded.",
      });
    }

    const result = await imageUpload(file.buffer);

    res.json({
      success: true,
      message: "Image uploaded successfully.",
      imageURL: result.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while uploading the image.",
    });
  }
};

// Add new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      quantity,
      totalStock,
    } = req.body;

    const newlyAddedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      quantity,
      totalStock,
    });

    await newlyAddedProduct.save();
    res.status(201).json({
      success: true,
      message: "Product added successfully.",
      data: newlyAddedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while adding new product.",
    });
  }
};

// Fetch all products
const fetchProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({});
    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: allProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching products.",
    });
  }
};

// Edit product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      quantity,
      totalStock,
    } = req.body;

    const updatedProduct = await Product.findById(id);

    if (!updatedProduct) {
      return res.status(401).json({
        success: false,
        message: "Product not found.",
      });
    }

    updatedProduct.image = image || updatedProduct.image;
    updatedProduct.title = title || updatedProduct.title;
    updatedProduct.description = description || updatedProduct.description;
    updatedProduct.category = category || updatedProduct.category;
    updatedProduct.brand = brand || updatedProduct.brand;
    updatedProduct.price = price || updatedProduct.price;
    updatedProduct.salePrice = salePrice || updatedProduct.salePrice;
    updatedProduct.quantity = quantity || updatedProduct.quantity;
    updatedProduct.totalStock = totalStock || updatedProduct.totalStock;

    await updatedProduct.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while editing product.",
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting product.",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchProducts,
  editProduct,
  deleteProduct,
};
