export const validateCartItem = (item) => {
  const errors = [];
  
  if (!item.productId) {
    errors.push('Missing productId');
  }
  
  if (!item.quantity || item.quantity < 1) {
    errors.push('Invalid quantity');
  }
  
  if (typeof item.quantity !== 'number') {
    errors.push('Quantity must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates entire cart structure
 */
export const validateCart = (cartItems) => {
  if (!Array.isArray(cartItems)) {
    return {
      isValid: false,
      errors: ['Cart items must be an array'],
      validItems: [],
      invalidItems: []
    };
  }
  
  const validItems = [];
  const invalidItems = [];
  const allErrors = [];
  
  cartItems.forEach((item, index) => {
    const validation = validateCartItem(item);
    
    if (validation.isValid) {
      validItems.push(item);
    } else {
      invalidItems.push({
        item,
        index,
        errors: validation.errors
      });
      allErrors.push(`Item ${index}: ${validation.errors.join(', ')}`);
    }
  });
  
  return {
    isValid: invalidItems.length === 0,
    errors: allErrors,
    validItems,
    invalidItems,
    summary: {
      total: cartItems.length,
      valid: validItems.length,
      invalid: invalidItems.length
    }
  };
};

/**
 * Sanitizes cart items for API calls
 */
export const sanitizeCartItems = (cartItems) => {
  const validation = validateCart(cartItems);
  
  return validation.validItems.map(item => ({
    productId: String(item.productId).trim(),
    quantity: parseInt(item.quantity) || 1,
    // Preserve additional fields if they exist
    ...(item.title && { title: item.title }),
    ...(item.price && { price: item.price }),
    ...(item.salePrice && { salePrice: item.salePrice }),
    ...(item.image && { image: item.image })
  }));
};

/**
 * Debug helper to log cart state
 */
export const debugCartState = (label, cartState) => {
  console.group(`🛒 [CART DEBUG] ${label}`);
  console.log('Cart Items Count:', cartState?.cartItems?.length || 0);
  console.log('Is Loading:', cartState?.isLoading);
  console.log('Error:', cartState?.error);
  console.log('Last Updated:', new Date(cartState?.lastUpdated).toISOString());
  
  if (cartState?.cartItems?.length > 0) {
    console.table(cartState.cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      title: item.title || 'N/A',
      price: item.price || 'N/A'
    })));
  }
  
  const validation = validateCart(cartState?.cartItems || []);
  if (!validation.isValid) {
    console.warn('Cart validation errors:', validation.errors);
  }
  
  console.groupEnd();
};

/**
 * Helper to compare two cart states
 */
export const compareCartStates = (oldCart, newCart, label = 'Cart Comparison') => {
  console.group(`🔄 [CART COMPARISON] ${label}`);
  
  const oldCount = oldCart?.cartItems?.length || 0;
  const newCount = newCart?.cartItems?.length || 0;
  
  console.log(`Items: ${oldCount} → ${newCount} (${newCount - oldCount >= 0 ? '+' : ''}${newCount - oldCount})`);
  
  if (oldCount > 0 && newCount > 0) {
    const oldIds = new Set((oldCart.cartItems || []).map(item => item.productId));
    const newIds = new Set((newCart.cartItems || []).map(item => item.productId));
    
    const added = [...newIds].filter(id => !oldIds.has(id));
    const removed = [...oldIds].filter(id => !newIds.has(id));
    
    if (added.length > 0) {
      console.log('➕ Added products:', added);
    }
    
    if (removed.length > 0) {
      console.log('➖ Removed products:', removed);
    }
    
    // Check for quantity changes
    const quantityChanges = [];
    oldCart.cartItems.forEach(oldItem => {
      const newItem = newCart.cartItems.find(item => item.productId === oldItem.productId);
      if (newItem && newItem.quantity !== oldItem.quantity) {
        quantityChanges.push({
          productId: oldItem.productId,
          old: oldItem.quantity,
          new: newItem.quantity,
          change: newItem.quantity - oldItem.quantity
        });
      }
    });
    
    if (quantityChanges.length > 0) {
      console.log('📊 Quantity changes:', quantityChanges);
    }
  }
  
  console.groupEnd();
};

/**
 * Helper to check localStorage cart health
 */
export const checkLocalStorageCart = () => {
  try {
    const guestCartStr = localStorage.getItem('guestCart');
    
    if (!guestCartStr) {
      console.log('📦 [STORAGE] No guest cart in localStorage');
      return { exists: false, isValid: true, items: [] };
    }
    
    const guestCart = JSON.parse(guestCartStr);
    const validation = validateCart(guestCart);
    
    console.log('📦 [STORAGE] Guest cart found:', {
      itemCount: guestCart.length,
      isValid: validation.isValid,
      errors: validation.errors
    });
    
    return {
      exists: true,
      isValid: validation.isValid,
      items: guestCart,
      validation
    };
    
  } catch (error) {
    console.error('📦 [STORAGE] Error reading guest cart:', error);
    return {
      exists: true,
      isValid: false,
      items: [],
      error: error.message
    };
  }
};
