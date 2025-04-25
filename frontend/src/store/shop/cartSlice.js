import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Load guest cart from localStorage
const loadGuestCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("guestCart")) || [];
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Failed to load guest cart:", error);
    return [];
  }
};

const initialState = {
  cartItems: loadGuestCart(),
  isLoading: false,
  error: null,
};

// Helper function for API calls
// In your cartSlice.js, update the makeCartRequest helper:
const makeCartRequest = async (method, endpoint, data = null) => {
  const token = getState().auth.tokenInMemory;
  
  const config = {
    method: method.toLowerCase(),
    url: `${import.meta.env.VITE_URL_API}/api/cart${endpoint}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    data
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Cart API error:`, error);
    throw error.response?.data?.message || error.message;
  }
};

// Thunks
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity, auth, details }, { dispatch, rejectWithValue }) => {
    try {
      const isAuthenticated = auth?.isAuthenticated;

      if (!isAuthenticated) {
        // Add to guest cart and save to localStorage
        dispatch(addToGuestCart({ productId, quantity, ...details }));
        return { isGuest: true };
      }

      // Authenticated user - API call
      await makeCartRequest("post", "/add", { productId, quantity });

      // Re-fetch cart after adding
      await dispatch(fetchCartItems());

      return { productId, quantity };
    } catch (error) {
      console.error("addToCart error:", error);
      return rejectWithValue(error);
    }
  }
);


export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    console.log('fetchCartItems triggered', { auth });

    try {
      if (!auth.isAuthenticated) {
        const localCart = JSON.parse(localStorage.getItem("guestCart")) || [];
        return { cart: { items: localCart }, isGuest: true };
      }

      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/cart`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        } 
      );

      console.log("✅ Authenticated fetch response:", response.data);

      const cart = response.data?.cart || response.data?.data?.cart || [];
      return { cart };
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 404) {
        return { cart: { items: [] } };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to load cart");
    }
  }
);


export const updateCartItemsQty = createAsyncThunk(
  "cart/updateItemsQty",
  async ({ productId, quantity }, { getState, dispatch }) => {
    const { auth } = getState();

    if (auth.isAuthenticated) {
      const response = await makeCartRequest("put", "/update", {
        productId,
        quantity,
      });
      return response;
    } else {
      dispatch(updateGuestCartItem({ productId, quantity }));
      return { success: true, isGuest: true };
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteItem",
  async (productId, { getState, dispatch }) => {
    const { auth } = getState();

    if (auth.isAuthenticated) {
      await makeCartRequest("delete", `/delete/${productId}`);
      return { productId };
    } else {
      dispatch(removeFromGuestCart(productId));
      return { productId, isGuest: true };
    }
  }
);

export const mergeCarts = createAsyncThunk(
  "cart/mergeCarts",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { auth, shopCart } = getState();

    if (!auth.isAuthenticated || shopCart.cartItems.length === 0) {
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/cart/merge`,
        { guestCartItems: shopCart.cartItems },
        { withCredentials: true }
      );
      dispatch(clearGuestCart());
      return response.data;
    } catch (error) {
      console.error("Merge error:", error);
      return rejectWithValue(error.response?.data?.message || "Merge failed");
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToGuestCart: (state, action) => {
      const { productId, quantity, ...details } = action.payload;
      const existingItem = state.cartItems.find((item) => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ productId, quantity, ...details });
      }
      localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
    },
    removeFromGuestCart: (state, action) => {
      state.cartItems = state.cartItems.filter((item) => item.productId !== action.payload);
      localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
    },
    updateGuestCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find((item) => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
      }
    },
    clearGuestCart: (state) => {
      state.cartItems = [];
      localStorage.removeItem("guestCart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.isGuest) {
          state.cartItems = action.payload.cart?.items || [];
        }
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCartItemsQty.fulfilled, (state, action) => {
        if (!action.payload.isGuest) {
          const { productId, quantity } = action.meta.arg;
          const item = state.cartItems.find((item) => item.productId === productId);
          if (item) item.quantity = quantity;
        }
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        if (!action.payload.isGuest) {
          state.cartItems = state.cartItems.filter(
            (item) => item.productId !== action.payload.productId
          );
        }
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        if (action.payload?.success) {
          state.cartItems = action.payload.cart?.items || [];
        }
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
