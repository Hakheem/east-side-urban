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
const addProduct = async (req, res)=>{
  try {
    const {
      image, title, description, category, brand, price, salePrice, quantity,
    } = req.body

    const newlyAddedProduct = new Product({
      image, title, description, category, brand, price, salePrice, quantity,
    })

    await newlyAddedProduct.save()
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
}


// fetch everything
const fetchProducts = async (req, res)=>{
  try {
    const allProducts = await Product.find({})
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
}


// Edit product
const editProduct = async (req, res)=>{
  try {
    const { id } = req.params;
    const { image, title, description, category, brand, price, salePrice, quantity } = req.body
    const updatedProduct = await Product.findById(id)

    if(!updatedProduct ) return res.status(401).json({
      success: false,
      message: "Product not found.",
    })
    
    findProduct.image = image || findProduct.image
    findProduct.title = title || findProduct.title
    findProduct.description = description || findProduct.description
    findProduct.category = category || findProduct.category
    findProduct.brand = brand || findProduct.brand
    findProduct.price = price || findProduct.price
    findProduct.salePrice = salePrice || findProduct.salePrice
    findProduct.quantity = quantity || findProduct.quantity

    await findProduct.save()
    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: findProduct,
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error while editing product.",
    });
    
  }
}


// Delete that product buana
const deleteProduct = async (req, res)=>{
  try {
    const {id} = req.params
    const product = await Product.findByIdAndDelete(id)

    if(!product)
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      })

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
}




module.exports = { handleImageUpload, addProduct, fetchProducts, editProduct, deleteProduct };
