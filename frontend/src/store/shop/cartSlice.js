import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Enhanced loadGuestCart with better error handling and logging
const loadGuestCart = () => {
  try {
    const serializedCart = localStorage.getItem("guestCart");
    if (!serializedCart) {
      console.log('[CART] No guest cart found in localStorage');
      return [];
    }
    
    const cart = JSON.parse(serializedCart);
    console.log('[CART] Loaded guest cart from localStorage:', cart);
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("[CART] Failed to load guest cart:", error);
    return [];
  }
};

const initialState = {
  cartItems: loadGuestCart(),
  isLoading: false,
  error: null,
  lastUpdated: Date.now(),
};

const makeCartRequest = async (method, endpoint, data = null, getState) => {
  const state = getState();
  const token = state?.auth?.tokenInMemory;
  const url = `${import.meta.env.VITE_URL_API}/api/cart${endpoint}`;

  const hasToken = !!token;

  console.log(`[CART] Making ${method.toUpperCase()} request to ${url}`, { 
    data,
    hasToken,
    timestamp: new Date().toISOString()
  });

  try {
    const config = {
      method: method.toLowerCase(),
      url,
      headers: {
        'Content-Type': 'application/json',
        ...(hasToken && { 'Authorization': `Bearer ${token}` })
      },
      withCredentials: true
    };

    if (data) config.data = data;

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`[CART] ${method.toUpperCase()} ${endpoint} failed:`, {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    });
    throw error;
  }
};


export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity, details }, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const isAuthenticated = state?.auth?.isAuthenticated;

      if (!isAuthenticated) {
        dispatch(addToGuestCart({ productId, quantity, ...details }));
        return { isGuest: true };
      }

    const response = await makeCartRequest(
  "post",
  "/add",
  { productId, quantity },
  getState
);

      
      await dispatch(fetchCartItems());
      return response;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const isAuthenticated = state?.auth?.isAuthenticated;
    const token = state?.auth?.tokenInMemory;

    if (!isAuthenticated || !token) {
      console.warn("[CART] Skipping fetchCartItems: not authenticated or no token");
      const localCart = JSON.parse(localStorage.getItem("guestCart")) || [];
      return { cart: { items: localCart }, isGuest: true };
    }

    try {
      const response = await makeCartRequest("get", "", null, getState);
      return { cart: response.cart || { items: [] } };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateCartItemsQty = createAsyncThunk(
  "cart/updateItemsQty",
  async ({ productId, quantity }, { getState, dispatch, rejectWithValue }) => {
    const { auth } = getState();
    const productIdStr = String(productId).trim();

    try {
      console.log('[CART] Updating quantity:', { 
        productId: productIdStr, 
        quantity,
        isAuthenticated: auth.isAuthenticated,
        timestamp: new Date().toISOString()
      });

      if (!auth.isAuthenticated) {
        console.log('[CART] Guest cart quantity update');
        dispatch(updateGuestCartItem({ productId: productIdStr, quantity }));
        return { productId: productIdStr, quantity, isGuest: true };
      }

      const response = await axios.put(
        `${import.meta.env.VITE_URL_API}/api/cart/update`,
        { productId: productIdStr, quantity },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.tokenInMemory}`
          },
          withCredentials: true
        }
      );

      console.log('[CART] Quantity update successful');
      return {
        productId: productIdStr,
        quantity,
        cart: response.data.cart || { items: [] }
      };

    } catch (error) {
      console.error('[CART] Update failed:', {
        error: error.response?.data || error.message,
        productId: productIdStr,
        quantity,
        timestamp: new Date().toISOString()
      });

      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update quantity"
      );
    }
  }
);




export const deleteCartItem = createAsyncThunk(
  "cart/delete",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const { auth } = getState();
    const productIdStr = String(productId).trim();

    try {
      if (!auth.isAuthenticated) {
        // Handle guest cart deletion
        console.log('Deleting from guest cart:', productIdStr);
        dispatch(removeFromGuestCart(productIdStr));
        return { 
          productId: productIdStr, 
          isGuest: true,
          cart: { items: JSON.parse(localStorage.getItem("guestCart")) || [] }
        };
      }

      // Handle authenticated user deletion
      console.log('Deleting from user cart:', productIdStr);
      const response = await axios.delete(
        `${import.meta.env.VITE_URL_API}/api/cart/${encodeURIComponent(productIdStr)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.tokenInMemory}`
          },
          withCredentials: true
        }
      );

      return {
        productId: productIdStr,
        cart: response.data.cart || { items: [] }
      };
      
    } catch (error) {
      console.error('Delete failed:', {
        productId: productIdStr,
        isAuthenticated: auth.isAuthenticated,
        error: error.response?.data || error.message
      });

      return rejectWithValue(
        error.response?.data?.message || "Failed to delete item"
      );
    }
  }
);



export const mergeCarts = createAsyncThunk(
  "cart/mergeCarts",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth, cart } = getState();
      
      console.log('[CART] Merge initiated', {
        isAuthenticated: auth.isAuthenticated,
        guestItemsCount: cart.cartItems.filter(item => !item.userId).length,
        timestamp: new Date().toISOString()
      });

      if (!auth.isAuthenticated) {
        console.log('[CART] No merge needed - not authenticated');
        return { 
          success: false, 
          message: "Not authenticated",
          cart: { items: cart.cartItems }
        };
      }

      // Get current guest cart items
      const guestCartItems = cart.cartItems.filter(item => !item.userId);
      
      if (guestCartItems.length === 0) {
        console.log('[CART] No guest items to merge');
        return { 
          success: true, 
          message: "No guest items to merge",
          cart: { items: cart.cartItems }
        };
      }

      console.log('[CART] Attempting to merge guest items');
      const response = await makeCartRequest(
        "post", 
        "/merge", 
        { guestCartItems },
        getState
      );

      if (!response?.cart) {
        throw new Error("Merge response did not include cart data");
      }

      // Clear guest cart only after successful merge
      dispatch(clearGuestCart());
      
      console.log('[CART] Merge successful');
      return {
        ...response,
        success: true,
        cart: response.cart || { items: cart.cartItems }
      };
    } catch (error) {
      console.error('[CART] Merge failed:', error);
      const currentItems = getState().cart.cartItems;
      return rejectWithValue({
        message: error.toString(),
        cart: { items: currentItems } // Return current items
      });
    }
  }
);
 


const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToGuestCart: (state, action) => {
      const { productId, quantity, ...details } = action.payload;
      console.log('[CART] Adding to guest cart:', { productId, quantity });
      
      const existingItem = state.cartItems.find((item) => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ productId, quantity, ...details });
      }
      
      localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
      console.log('[CART] Saved guest cart to localStorage');
    },
    removeFromGuestCart: (state, action) => {
      const productId = action.payload;
      console.log('[CART] Removing from guest cart:', productId);
      
      // Create a new array without the deleted item
      const newCartItems = state.cartItems.filter(
        (item) => item.productId !== productId
      );
      
      // Update state and localStorage
      state.cartItems = newCartItems;
      localStorage.setItem("guestCart", JSON.stringify(newCartItems));
      
      console.log('[CART] Updated guest cart after removal:', {
        removedItem: productId,
        remainingItems: newCartItems.length
      });
    },
    updateGuestCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      console.log('[CART] Updating guest cart item:', { productId, quantity });
      
      const item = state.cartItems.find((item) => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
      }
    },
    clearGuestCart: (state) => {
      state.cartItems = state.cartItems.filter(item => item.userId); 
      localStorage.removeItem("guestCart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.isGuest) {
          console.log('[CART] Updating state with server cart:', action.payload.cart?.items);
          state.cartItems = action.payload.cart?.items || [];
        }
        state.lastUpdated = Date.now();
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.cart?.items) {
          console.log('[CART] Updating state with merged cart');
          state.cartItems = action.payload.cart.items;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(mergeCarts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Merge partially failed";
        if (action.payload?.cart?.items) {
          console.log('[CART] Merge failed, keeping existing items');
          state.cartItems = action.payload.cart.items;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(updateCartItemsQty.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isGuest) return;
        
        if (action.payload.cart?.items) {
          state.cartItems = action.payload.cart.items;
        } else {
          const { productId, quantity } = action.payload;
          const item = state.cartItems.find(item => item.productId === productId);
          if (item) {
            item.quantity = quantity;
          }
        }
        state.lastUpdated = Date.now();
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
      if (action.payload.isGuest) return;
      
      if (action.payload.cart?.items) {
        state.cartItems = action.payload.cart.items;
      } else {
        state.cartItems = state.cartItems.filter(
          item => item.productId !== action.payload.productId
        );
      }
    })
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('cart/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = typeof action.payload === 'string' 
            ? action.payload 
            : action.payload?.message || "An error occurred";
          console.error('[CART] Error:', state.error);
          state.lastUpdated = Date.now();
        }
      );
  }
});

export const {
  addToGuestCart, 
  removeFromGuestCart,
  updateGuestCartItem,
  clearGuestCart,
} = cartSlice.actions;

export default cartSlice.reducer;