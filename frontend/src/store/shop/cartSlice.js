import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/* ========= Local guest cart helpers ========= */
const loadGuestCart = () => {
  try {
    const str = localStorage.getItem("guestCart");
    if (!str) return [];
    const cart = JSON.parse(str);
    return Array.isArray(cart) ? cart : [];
  } catch (e) {
    console.error("[CART] Failed to load guest cart:", e);
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem("guestCart", JSON.stringify(items ?? []));
  } catch (e) {
    console.error("[CART] Failed to save guest cart:", e);
  }
};

/* ========= Initial State ========= */
const initialState = {
  cartItems: loadGuestCart(),
  isLoading: false,
  error: null,
  lastUpdated: Date.now(),
};

/* ========= Request helper (cookie-based auth) ========= */
const makeCartRequest = async (method, endpoint, data = null) => {
  const url = `${import.meta.env.VITE_URL_API}/api/cart${endpoint}`;
  const config = {
    method: method.toLowerCase(),
    url,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    ...(data ? { data } : {}),
  };

  try {
    const res = await axios(config);
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    console.error(`[CART] ${method.toUpperCase()} ${endpoint} failed:`, {
      message: msg,
      status: error.response?.status,
    });
    throw new Error(msg);
  }
};

/* ========= Thunks ========= */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, quantity, details },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      const isAuthenticated = getState()?.auth?.isAuthenticated;

      // Guests: keep operating in localStorage
      if (!isAuthenticated) {
        dispatch(addToGuestCart({ productId, quantity, ...details }));
        return { isGuest: true };
      }

      // Auth users: hit server (cookies carry the token)
      const response = await makeCartRequest("post", "/add", {
        productId,
        quantity,
      });

      // Always refetch full cart after server mutation
      await dispatch(fetchCartItems());
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { getState, rejectWithValue }) => {
    const isAuthenticated = getState()?.auth?.isAuthenticated;

    // Guests: read from localStorage only
    if (!isAuthenticated) {
      const localCart = loadGuestCart();
      return { isGuest: true, cart: { items: localCart } };
    }

    // Auth users: always ask the server (cookie-based)
    try {
      const response = await makeCartRequest("get", "");
      // Expecting { success, cart: { items: [...] } }
      return { isGuest: false, cart: response.cart || { items: [] } };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCartItemsQty = createAsyncThunk(
  "cart/updateItemsQty",
  async ({ productId, quantity }, { getState, dispatch, rejectWithValue }) => {
    try {
      const isAuthenticated = getState()?.auth?.isAuthenticated;

      if (!isAuthenticated) {
        // Update guest cart locally
        dispatch(
          updateGuestCartItem({ productId: String(productId), quantity })
        );
        return { isGuest: true, productId: String(productId), quantity };
      }

      await makeCartRequest("put", "/update", {
        productId: String(productId),
        quantity,
      });

      const refreshed = await dispatch(fetchCartItems()).unwrap();
      return { ...refreshed, productId: String(productId), quantity };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to update quantity");
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteItem",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    try {
      const isAuthenticated = getState()?.auth?.isAuthenticated;
      const productIdStr = String(productId).trim();

      if (!isAuthenticated) {
        dispatch(removeFromGuestCart(productIdStr));
        return {
          isGuest: true,
          productId: productIdStr,
          cart: { items: loadGuestCart() },
        };
      }

      await makeCartRequest(
        "delete",
        `/delete/${encodeURIComponent(productIdStr)}`
      );
      const refreshed = await dispatch(fetchCartItems()).unwrap();
      return { ...refreshed, productId: productIdStr };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to delete item");
    }
  }
);

export const mergeCarts = createAsyncThunk(
  "cart/mergeCarts",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const isAuthenticated = state?.auth?.isAuthenticated;
      const guestItems = state?.shopCart?.cartItems?.filter((item) => !item.userId) || [];

      console.log("[Redux mergeCarts] Starting merge process");
      console.log("[Redux mergeCarts] isAuthenticated:", isAuthenticated);
      console.log("[Redux mergeCarts] guestItems count:", guestItems.length);

      if (!isAuthenticated) {
        console.log("[Redux mergeCarts] User not authenticated, skipping merge");
        return {
          success: false,
          message: "Not authenticated",
          cart: { items: guestItems },
        };
      }

      // If no guest items, just fetch the current user cart
      if (guestItems.length === 0) {
        console.log("[Redux mergeCarts] No guest items to merge, fetching current cart");
        const resp = await dispatch(fetchCartItems()).unwrap();
        return {
          success: true,
          message: "No guest items to merge",
          cart: resp.cart,
        };
      }

      // Prepare guest items for merging (ensure consistent structure)
      const sanitizedGuestItems = guestItems.map(item => ({
        productId: String(item.productId).trim(),
        quantity: parseInt(item.quantity) || 1,
        // Include any additional fields that might be useful for validation
        title: item.title,
        price: item.price,
        salePrice: item.salePrice,
        image: item.image
      }));

      console.log("[Redux mergeCarts] Sanitized guest items:", sanitizedGuestItems);

      // Call the merge API
      const response = await makeCartRequest("post", "/merge", {
        guestCartItems: sanitizedGuestItems,
      });

      console.log("[Redux mergeCarts] Merge API response:", response);

      // Clear guest cart from localStorage after successful merge
      dispatch(clearGuestCart());
      console.log("[Redux mergeCarts] Guest cart cleared from localStorage");

      return {
        success: true,
        message: response.message || "Carts merged successfully",
        cart: response.cart || { items: [] },
        mergeStats: response.mergeStats, // Pass through merge statistics
      };

    } catch (err) {
      console.error("[Redux mergeCarts] Error:", err);
      
      // In case of error, preserve the current cart items
      const currentItems = getState().shopCart.cartItems;
      
      return rejectWithValue({
        message: err.message || "Merge failed",
        cart: { items: currentItems },
        // Don't clear guest cart if merge failed
        preserveGuestCart: true
      });
    }
  }
);



export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const isAuthenticated = getState()?.auth?.isAuthenticated;

      // For guest users: just clear localStorage
      if (!isAuthenticated) {
        dispatch(clearGuestCart());
        return {
          isGuest: true,
          message: "Guest cart cleared successfully",
          cart: { items: [] }
        };
      }

      // For authenticated users: call server to clear cart
      const response = await makeCartRequest("delete", "/clear");

      return {
        isGuest: false,
        message: response.message || "Cart cleared successfully",
        cart: { items: [] }
      };
    } catch (err) {
      return rejectWithValue(err.message || "Failed to clear cart");
    }
  }
);

/* ========= Slice ========= */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToGuestCart: (state, action) => {
      const { productId, quantity, ...details } = action.payload;
      const pid = String(productId);
      const existing = state.cartItems.find((i) => i.productId === pid);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.cartItems.push({ productId: pid, quantity, ...details });
      }
      saveGuestCart(state.cartItems);
    },
    removeFromGuestCart: (state, action) => {
      const pid = String(action.payload);
      state.cartItems = state.cartItems.filter((i) => i.productId !== pid);
      saveGuestCart(state.cartItems);
    },
    updateGuestCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find(
        (i) => i.productId === String(productId)
      );
      if (item) {
        item.quantity = quantity;
        saveGuestCart(state.cartItems);
      }
    },
    clearGuestCart: (state) => {
      // Clear all items from guest cart
      state.cartItems = [];
      localStorage.removeItem("guestCart");
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch cart
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        // Always reflect whatever we fetched (guest or auth)
        state.cartItems = action.payload.cart?.items || [];
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch cart";
        state.lastUpdated = Date.now();
      })

      // merge carts
      .addCase(mergeCarts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.cartItems = action.payload.cart?.items || [];
        state.lastUpdated = Date.now();
      })
      .addCase(mergeCarts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Merge partially failed";
        if (action.payload?.cart?.items) {
          state.cartItems = action.payload.cart.items;
        }
        state.lastUpdated = Date.now();
      })

      // update qty
      .addCase(updateCartItemsQty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemsQty.fulfilled, (state, action) => {
        state.isLoading = false;
        // If server sent back cart, use it. For guest, reducer already updated.
        if (!action.payload?.isGuest && action.payload?.cart?.items) {
          state.cartItems = action.payload.cart.items;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(updateCartItemsQty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update quantity";
        state.lastUpdated = Date.now();
      })

      // delete item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.cart?.items) {
          state.cartItems = action.payload.cart.items;
        } else if (action.payload?.productId) {
          state.cartItems = state.cartItems.filter(
            (i) => i.productId !== action.payload.productId
          );
        }
        state.lastUpdated = Date.now();
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete item";
        state.lastUpdated = Date.now();
      })

      // clear cart
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = [];
        state.error = null;
        state.lastUpdated = Date.now();
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to clear cart";
        state.lastUpdated = Date.now();
      });
  },
});
 
export const {
  addToGuestCart,
  removeFromGuestCart, 
  updateGuestCartItem,
  clearGuestCart,
} = cartSlice.actions;



export default cartSlice.reducer;

