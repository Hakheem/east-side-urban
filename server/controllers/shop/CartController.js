const Cart = require("../../models/Cart");
const Product = require("../../models/Products");
const mongoose = require('mongoose');

// Validate stock
const validateStock = async (productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");
    if (product.totalStock < quantity) {
      throw new Error(`Only ${product.totalStock} item(s) available`);
    }
    return product; 
  } catch (error) {
    console.error("Stock validation error:", error);
    throw error;
  }
};

const getCart = async (userId, sessionId) => {
  try {
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      return await Cart.findOne({ userId }).populate('items.productId');
    }
    
    if (sessionId) {
      return await Cart.findOne({ sessionId }).populate('items.productId');
    }
    
    return null;
  } catch (error) { 
    console.error("Cart lookup error:", error);
    throw error;
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;

    console.log("=== addToCart called ===");
    console.log("Request body:", { productId, quantity });
    console.log("User ID:", userId);

    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and quantity (≥1) are required"
      });
    }

    // Validate stock
    const product = await validateStock(productId, quantity);
    console.log("Product validation success:", product);

    // Find cart by userId
    let cart = await Cart.findOne({ userId });
    console.log("Fetched cart:", cart);

    if (!cart) {
      console.log("No cart found, creating new cart...");
      cart = await Cart.create({
        userId,
        items: [{
          productId,
          quantity,
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          image: product.image || "",
          totalStock: product.totalStock
        }]
      });
      console.log("New cart created:", cart);
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      console.log("Existing cart item:", existingItem);

      if (existingItem) {
        console.log("Updating quantity...");
        existingItem.quantity += quantity;
        // Validate updated quantity
        await validateStock(productId, existingItem.quantity);
      } else {
        console.log("Adding new item to cart...");
        cart.items.push({
          productId,
          quantity,
          title: product.title,
          price: product.price,
          salePrice: product.salePrice,
          image: product.image || "",
          totalStock: product.totalStock
        });
      }

      await cart.save();
      console.log("Cart saved successfully.");
    }

    // Return updated cart
    const updatedCart = await Cart.findById(cart._id)
    .populate("items.productId", "title price salePrice image totalStock")

    console.log("Updated cart populated:", updatedCart);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart: {
        items: updatedCart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          title: item.productId.title,
          price: item.productId.price,
          salePrice: item.productId.salePrice,
          image: item.productId.image || "",
          stock: item.productId.totalStock
        }))
      }
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// fetchCartItems
const fetchCartItems = async (req, res) => {
  console.log("\n========== FETCH CART ITEMS ==========");
  console.log("-> req.user:", req.user);
  console.log("-> req.cookies:", req.cookies);
  console.log("-> req.sessionID:", req.sessionID);

  try {
    const userId = req.user?.id;
    const sessionId = req.cookies?.guestSessionId || req.sessionID;

    console.log(`--> Deciding fetch logic:`);
    console.log("   userId:", userId);
    console.log("   sessionId:", sessionId);

    let cart;
    if (userId) {
      console.log("-> Searching by userId...");
      cart = await Cart.findOne({ userId })
      .populate("items.productId", "title price salePrice image totalStock")

    } else if (sessionId) {
      console.log("-> Searching by sessionId...");
      cart = await Cart.findOne({ sessionId }).populate("items.productId", "title price salePrice image totalStock")

    } else {
      console.log("-> No userId or sessionId, returning empty.");
      return res.status(200).json({
        success: true,
        cart: { items: [] }
      });
    }

    if (!cart) {
      console.log("-> No cart found, returning empty.");
      return res.status(200).json({
        success: true,
        cart: { items: [] }
      });
    }

    console.log(`-> Cart found with ${cart.items.length} items.`);

    res.status(200).json({
      success: true,
      cart: {
        items: cart.items.map(item => ({
          productId: item.productId?._id,
          quantity: item.quantity,
          title: item.productId?.title,
          price: item.productId?.price,
          salePrice: item.productId?.salePrice,
          image: item.productId?.image || "",
          stock: item.productId?.totalStock,
        }))
      }
    });
  } catch (error) {
    console.error("Fetch cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart"
    });
  }
};

// updateCartItemsQty
const updateCartItemsQty = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.cookies?.guestSessionId || req.sessionID;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid product ID and quantity (≥1) are required"
      });
    }

    await validateStock(productId, quantity);
    const cart = await getCart(userId, sessionId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const item = cart.items.find(item => 
      (item.productId._id || item.productId).toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: "Quantity updated",
      productId,
      quantity
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// deleteCartItem
const deleteCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.cookies?.guestSessionId || req.sessionID;

    const cart = await getCart(userId, sessionId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => (item.productId._id || item.productId).toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    await cart.save();
    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      productId
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item"
    });
  }
};

// Clear cart function
const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID;

    console.log('[CLEAR CART] Request:', {
      userId,
      sessionId,
      userAgent: req.headers['user-agent']?.substring(0, 50)
    });

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'No user or session identifier found'
      });
    }

    // For authenticated users, clear by userId
    if (userId) {
      const result = await Cart.deleteMany({ userId });
      console.log(`[CLEAR CART] Cleared ${result.deletedCount} cart items for user:`, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        deletedCount: result.deletedCount
      });
    }

    // For guests, clear by sessionId
    const result = await Cart.deleteMany({ sessionId });
    console.log(`[CLEAR CART] Cleared ${result.deletedCount} cart items for session:`, sessionId);

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('[CLEAR CART] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};


const mergeGuestCart = async (req, res) => {
  const userId = req.user.id;
  const sessionId = req.cookies?.guestSessionId || req.sessionID;
  const guestCartItems = req.body?.guestCartItems || [];

  console.log(`[CartController] Merging carts - userId: ${userId}, sessionId: ${sessionId}`);
  console.log("[CartController] Received guestCartItems:", JSON.stringify(guestCartItems, null, 2));

  try {
    let guestCart = null;
    if (sessionId) {
      guestCart = await Cart.findOne({ sessionId });
      console.log("[CartController] Guest cart from DB:", guestCart ? `Found with ${guestCart.items.length} items` : 'Not found');
    }

    const itemsToMerge = [];

    // 1️⃣ Items from DB guest cart (if exists)
    if (guestCart && guestCart.items.length > 0) {
      console.log("[CartController] Adding items from DB guest cart");
      itemsToMerge.push(...guestCart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })));
    }

    // 2️⃣ Items from posted guestCartItems (from localStorage)
    if (guestCartItems.length > 0) {
      console.log("[CartController] Adding items from frontend localStorage");
      for (const item of guestCartItems) {
        if (item.productId && item.quantity > 0) {
          // Check if this product is already in itemsToMerge from DB
          const existingMergeItem = itemsToMerge.find(i => 
            i.productId.toString() === item.productId.toString()
          );
          
          if (existingMergeItem) {
            // Combine quantities if same product exists in both DB and localStorage
            existingMergeItem.quantity += item.quantity;
            console.log(`[CartController] Combined quantities for product ${item.productId}: ${existingMergeItem.quantity}`);
          } else {
            itemsToMerge.push({
              productId: item.productId,
              quantity: item.quantity
            });
          }
        }
      }
    }

    console.log(`[CartController] Total items to merge: ${itemsToMerge.length}`);

    if (itemsToMerge.length === 0) {
      console.log("[CartController] No guest items to merge, returning current user cart");
      const existing = await Cart.findOne({ userId })
        .populate("items.productId", "title price salePrice image totalStock");

      return res.status(200).json({
        success: true,
        message: "No guest items to merge",
        cart: {
          items: existing
            ? existing.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                title: item.productId.title,
                price: item.productId.price, 
                salePrice: item.productId.salePrice,
                stock: item.productId.totalStock,
                image: item.productId.image || ""
              }))
            : []
        }
      });
    }

    // 3️⃣ Get or create user cart
    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
      console.log("[CartController] No user cart found, creating new one...");
      userCart = await Cart.create({
        userId,
        items: []
      });
    }

    console.log(`[CartController] User cart has ${userCart.items.length} existing items`);

    // 4️⃣ Merge logic with proper validation
    let mergedCount = 0;
    let skippedCount = 0;
    
    for (const guestItem of itemsToMerge) {
      try {
        // Validate and fetch product details
        const product = await Product.findById(guestItem.productId);
        
        if (!product) {
          console.warn(`[CartController] Product not found for ID: ${guestItem.productId}, skipping`);
          skippedCount++;
          continue;
        }

        // Check stock availability
        if (product.totalStock < guestItem.quantity) {
          console.warn(`[CartController] Insufficient stock for ${product.title}: requested ${guestItem.quantity}, available ${product.totalStock}`);
          // You can choose to either skip this item or add available quantity
          // For now, let's add available quantity if > 0
          if (product.totalStock > 0) {
            guestItem.quantity = product.totalStock;
          } else {
            skippedCount++;
            continue;
          }
        }

        // Find existing item in user cart
        const existingItem = userCart.items.find(i =>
          i.productId.toString() === guestItem.productId.toString()
        );

        if (existingItem) {
          // Update existing item quantity
          const newQuantity = existingItem.quantity + guestItem.quantity;
          
          // Check if combined quantity exceeds stock
          if (newQuantity > product.totalStock) {
            console.warn(`[CartController] Combined quantity exceeds stock for ${product.title}: setting to max available`);
            existingItem.quantity = product.totalStock;
          } else {
            existingItem.quantity = newQuantity;
          }
          
          console.log(`[CartController] Updated existing item ${product.title}: quantity = ${existingItem.quantity}`);
        } else {
          // Add new item to user cart
          userCart.items.push({
            productId: product._id,
            quantity: guestItem.quantity,
            title: product.title, // Fixed: was product.name
            price: product.price,
            salePrice: product.salePrice,
            image: product.image || "",
            totalStock: product.totalStock
          });
          
          console.log(`[CartController] Added new item ${product.title}: quantity = ${guestItem.quantity}`);
        }
        
        mergedCount++;
      } catch (itemError) {
        console.error(`[CartController] Error processing item ${guestItem.productId}:`, itemError);
        skippedCount++;
      }
    }

    // Save the merged cart
    await userCart.save();
    console.log(`[CartController] Merge complete: ${mergedCount} items merged, ${skippedCount} items skipped`);

    // 5️⃣ Cleanup: Delete guest cart from DB
    if (guestCart) {
      await Cart.deleteOne({ sessionId });
      console.log("[CartController] Guest cart deleted from DB");
    }

    // 6️⃣ Return the final merged cart with populated product details
    const finalCart = await Cart.findOne({ userId })
      .populate("items.productId", "title price salePrice image totalStock");

    console.log(`[CartController] Final merged cart has ${finalCart.items.length} items`);

    res.status(200).json({
      success: true,
      message: `Cart merged successfully ${mergedCount} items added${skippedCount > 0 ? `, ${skippedCount} items skipped due to issues` : ''}`,
      cart: {
        items: finalCart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          title: item.productId.title,
          price: item.productId.price,
          salePrice: item.productId.salePrice,
          stock: item.productId.totalStock,
          image: item.productId.image || ""
        }))
      },
      mergeStats: {
        merged: mergedCount,
        skipped: skippedCount
      }
    });

  } catch (error) {
    console.error("[CartController] Merge error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to merge carts: " + error.message,
      cart: { items: [] }
    });
  }
};


module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemsQty, 
  deleteCartItem,
  clearCart,
  mergeGuestCart
};
