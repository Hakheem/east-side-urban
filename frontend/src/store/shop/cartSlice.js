import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Load guest cart from localStorage
const loadGuestCart = () => {
  try {
    const cart = JSON.parse(localStorage.getItem("guestCart")) || [];
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
};

const initialState = {
  cartItems: loadGuestCart(),
  isLoading: false,
  error: null,
  lastUpdated: Date.now(),
};

// Thunk: Add to Cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, { getState, dispatch, rejectWithValue }) => {
    const { auth, shopProducts } = getState();

    try {
      if (auth.isAuthenticated) {
        // Authenticated user - call API
        const response = await axios.post(
          `${import.meta.env.VITE_URL_API}/api/cart/add`,
          { productId, quantity },
          { withCredentials: true }
        );
        return response.data;
      } else {
        // Guest user - add to local storage
        const product = shopProducts.productList.find(
          (p) => p._id === productId
        );
        if (!product) {
          throw new Error("Product not found");
        }

        const newItem = {
          productId,
          quantity,
          title: product.name,
          price: product.price,
          salePrice: product.salePrice,
          image: product.images?.[0] || "",
          stock: product.stock,
        };

        dispatch(addToGuestCart(newItem));
        return { success: true, isGuest: true };
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart"
      );
    }
  }
);

// Thunk: Fetch Cart Items
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();

    if (!auth.isAuthenticated) {
      // Return guest cart from localStorage
      return {
        cart: { items: getState().cart.cartItems },
        isGuest: true,
      };
    }

    try {
      // Fetch cart from API for authenticated user
      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/cart/get/me`,
        { withCredentials: true }
      );

      // Ensure items have proper structure
      const normalizedItems =
        response.data.cart?.items?.map((item) => ({
          ...item,
          id: item.productId, // For React keys
        })) || [];

      return {
        ...response.data,
        cart: {
          items: normalizedItems,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load cart"
      );
    }
  }
);

// Thunk: Update Cart Item Quantity
export const updateCartItemsQty = createAsyncThunk(
  "cart/updateItemsQty",
  async ({ productId, quantity }, { getState, dispatch, rejectWithValue }) => {
    const { auth } = getState();

    try {
      if (auth.isAuthenticated) {
        // Authenticated user - call API
        const response = await axios.put(
          `${import.meta.env.VITE_URL_API}/api/cart/update-cart`,
          { productId, quantity },
          { withCredentials: true }
        );
        return response.data;
      } else {
        // Guest user - dispatch local action
        dispatch(updateGuestCartItem({ productId, quantity }));
        return { productId, quantity, isGuest: true };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

// Thunk: Delete Cart Item
export const deleteCartItem = createAsyncThunk(
  "cart/deleteItem",
  async (productId, { getState, dispatch, rejectWithValue }) => {
    const { auth } = getState();

    try {
      if (auth.isAuthenticated) {
        // Authenticated user - call API
        await axios.delete(
          `${import.meta.env.VITE_URL_API}/api/cart/delete/me/${productId}`,
          { withCredentials: true }
        );
        return { productId };
      } else {
        // Guest user - dispatch local action
        dispatch(removeFromGuestCart(productId));
        return { productId, isGuest: true };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

// Thunk: Merge Carts After Login
export const mergeCarts = createAsyncThunk(
  "cart/mergeCarts",
  async (_, { getState, dispatch, rejectWithValue }) => {
    const { auth, cart } = getState();

    // Skip if not authenticated or no guest items
    if (!auth.isAuthenticated || cart.cartItems.length === 0) return;

    try {
      // Call merge API
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/cart/merge`,
        { guestCartItems: cart.cartItems },
        { withCredentials: true }
      );

      // Clear guest cart after successful merge
      dispatch(clearGuestCart());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Merge failed");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Add item to guest cart
    addToGuestCart: (state, action) => {
      const { productId, quantity, ...productDetails } = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({
          productId,
          quantity,
          ...productDetails,
          id: productId,
        });
      }

      state.lastUpdated = Date.now();
      localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
    },

    // Remove item from guest cart
    removeFromGuestCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (item) => item.productId !== action.payload
      );
      state.lastUpdated = Date.now();
      localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
    },

    // Update guest cart item quantity
    updateGuestCartItem: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cartItems.find((item) => item.productId === productId);

      if (item) {
        item.quantity = quantity;
        state.lastUpdated = Date.now();
        localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
      }
    },

    // Clear guest cart
    clearGuestCart: (state) => {
      state.cartItems = [];
      state.lastUpdated = Date.now();
      localStorage.removeItem("guestCart");
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.isGuest) {
          state.cartItems = action.payload.cart?.items || [];
          state.lastUpdated = Date.now();
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Cart
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.isGuest) {
          state.cartItems = action.payload.cart?.items || [];
          state.lastUpdated = Date.now();
        }
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Quantity
      .addCase(updateCartItemsQty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemsQty.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isGuest) {
          const { productId, quantity } = action.payload;
          const item = state.cartItems.find(
            (item) => item.productId === productId
          );
          if (item) {
            item.quantity = quantity;
            state.lastUpdated = Date.now();
            localStorage.setItem("guestCart", JSON.stringify(state.cartItems));
          }
        } else {
          state.cartItems = action.payload.cart?.items || [];
          state.lastUpdated = Date.now();
        }
      })
      .addCase(updateCartItemsQty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        if (!action.payload.isGuest) {
          state.cartItems = state.cartItems.filter(
            (item) => item.productId !== action.payload.productId
          );
          state.lastUpdated = Date.now();
        }
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Merge Carts
      .addCase(mergeCarts.fulfilled, (state, action) => {
        if (action.payload) {
          state.cartItems = action.payload.cart?.items || [];
          state.lastUpdated = Date.now();
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
