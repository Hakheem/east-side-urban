const Cart = require("../../models/Cart");
const Product = require("../../models/Products");
const mongoose = require('mongoose');

const validateStock = async (productId, quantity) => {
  const product = await Product.findById(productId).select("stock");
  if (!product) {
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    throw new Error(`Only ${product.stock} item(s) left`);
  }
  return product;
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  const sessionId = req.sessionID;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }

  try {
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required"
      });
    }

    const product = await validateStock(productId, quantity);
    let cart = await Cart.findOne({ $or: [{ userId }, { sessionId }] });

    if (!cart) {
      cart = await Cart.create({
        userId,
        sessionId,
        items: [{
          productId,
          quantity,
          productName: product.name,
          productPrice: product.price,
          productSalePrice: product.salePrice,
          productImage: product.images?.[0],
          productStock: product.stock,
        }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );

      if (itemIndex >= 0) {
        const newQty = cart.items[itemIndex].quantity + quantity;
        await validateStock(productId, newQty);
        cart.items[itemIndex].quantity = newQty;
      } else {
        cart.items.push({
          productId,
          quantity,
          productName: product.name,
          productPrice: product.price,
          productSalePrice: product.salePrice,
          productImage: product.images?.[0],
          productStock: product.stock,
        });
      }
      await cart.save();
    }

    const responseCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price salePrice images stock"
    );

    const formattedItems = responseCart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      title: item.productId.name,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      image: item.productId.images?.[0] || "",
      stock: item.productId.stock,
    }));

    res.status(200).json({
      success: true,
      cart: { items: formattedItems },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const fetchCartItems = async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.sessionID;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }

  try {
    // Find cart with proper error handling
    const cart = await Cart.findOne({
      $or: [{ userId }, { sessionId }],
    })
    .populate("items.productId", "name price salePrice images stock")
    .lean(); // Convert to plain JS object

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [] }
      });
    }

    // Format items safely
    const formattedItems = (cart.items || []).map(item => {
      // Handle cases where product might not be populated
      const product = item.productId || {};
      return {
        productId: product._id || item.productId,
        quantity: item.quantity,
        title: product.name || '',
        price: product.price || 0,
        salePrice: product.salePrice || null,
        image: (product.images && product.images[0]) || "",
        stock: product.stock || 0,
      };
    });

    res.status(200).json({
      success: true,
      cart: { items: formattedItems },
    });
  } catch (error) {
    console.error('Fetch cart error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message
    });
  }
};

const updateCartItemsQty = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  const sessionId = req.sessionID;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }

  try {
    await validateStock(productId, quantity);
    const cart = await Cart.findOne({ $or: [{ userId }, { sessionId }] });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(item => item.productId.equals(productId));
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price salePrice images stock"
    );

    const formattedItems = updatedCart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      title: item.productId.name,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      image: item.productId.images?.[0] || "",
      stock: item.productId.stock,
    }));

    res.status(200).json({
      success: true,
      cart: { items: formattedItems },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCartItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const sessionId = req.sessionID;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }

  try {
    const cart = await Cart.findOne({ $or: [{ userId }, { sessionId }] });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialCount = cart.items.length;
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    if (cart.items.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    await cart.save();
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting item",
    });
  }
};

const mergeGuestCart = async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.sessionID;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format"
    });
  }

  try {
    const guestCart = await Cart.findOne({ sessionId });
    
    if (!guestCart || guestCart.items.length === 0) {
      return res.status(200).json({ success: true });
    }

    let userCart = await Cart.findOne({ userId });
    
    if (!userCart) {
      userCart = await Cart.create({
        userId,
        items: guestCart.items,
      });
    } else {
      for (const guestItem of guestCart.items) {
        const existingItem = userCart.items.find(
          item => item.productId.toString() === guestItem.productId.toString()
        );

        if (existingItem) {
          existingItem.quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
        }
      }
      await userCart.save();
    }

    await Cart.deleteOne({ sessionId });

    const mergedCart = await Cart.findById(userCart._id).populate(
      "items.productId",
      "name price salePrice images stock"
    );

    const formattedItems = mergedCart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      title: item.productId.name,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      image: item.productId.images?.[0] || "",
      stock: item.productId.stock,
    }));

    res.status(200).json({
      success: true,
      cart: { items: formattedItems },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Merge failed",
    });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemsQty,
  deleteCartItem,
  mergeGuestCart,
};