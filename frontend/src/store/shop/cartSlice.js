import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  cartItems: [],
  isLoading: false,
  error: null,
};

// Add to Cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, productId, quantity }) => {
    const response = await axios.post(
      `${import.meta.env.VITE_URL_API}/api/cart/add`, 
      { userId, productId, quantity }
    );
    return response.data; 
  }
);

// Fetch Cart Items
export const fetchCartItems = createAsyncThunk(
  'cart/fetchCartItems',
  async (userId) => {
    const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/cart/get/${userId}`);
    return response.data;
  }
);

// Update Cart Item Quantity
export const updateCartItemsQty = createAsyncThunk(
  'cart/updateCartItemsQty',
  async ({ userId, productId, quantity }) => {
    const response = await axios.put(
      `${import.meta.env.VITE_URL_API}/api/cart/update-cart`, 
      { userId, productId, quantity }
    );
    return response.data;
  }
);

// Delete Cart Item
export const deleteCartItem = createAsyncThunk(
  'cart/deleteCartItem',
  async ({ userId, productId }) => {
    const response = await axios.delete(`${import.meta.env.VITE_URL_API}/api/cart/delete/${userId}/${productId}`);
    return response.data;
  }
);

// ** Slice **
const cartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || []; 
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error adding to cart';
      })

      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || [];
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error fetching cart items';
      })

      // Update Cart Items Quantity
      .addCase(updateCartItemsQty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartItemsQty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || [];
      })
      .addCase(updateCartItemsQty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error updating cart item quantity';
      })

      // Delete Cart Item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data || []; 
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error deleting cart item';
      });
  },
});

export default cartSlice.reducer;
