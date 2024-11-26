import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  cartItems: [],
  isLoading: false,
};

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ userId, productId, quantity }, { rejectWithValue }) => {
      try {
        const response = await axios.post("http://localhost:5000/api/cart/add", {
          userId,
          productId,
          quantity,
        });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || error.message || "Failed to add to cart"
        );
      }
    }
  );
  
  export const fetchCartItems = createAsyncThunk(
    "cart/fetchCartItems",
    async (userId, { rejectWithValue }) => {
      try {
        const response = await axios.get("http://localhost:5000/api/cart/fetch", {
          params: { userId },
        });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || error.message || "Failed to fetch cart items"
        );
      }
    }
  );
  
  export const updateCartItemsQty = createAsyncThunk(
    "cart/updateCartItemsQty",
    async ({ productId, quantity }, { rejectWithValue }) => {
      try {
        const response = await axios.put("http://localhost:5000/api/cart/update-cart", {
          productId,
          quantity,
        });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || error.message || "Failed to update cart quantity"
        );
      }
    }
  );
  
  export const deleteCartItem = createAsyncThunk(
    "cart/deleteCartItem",
    async ({ userId, productId }, { rejectWithValue }) => {
      try {
        const response = await axios.delete("http://localhost:5000/api/cart/delete", {
          data: { userId, productId },
        });
        return response.data.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || error.message || "Failed to delete cart item"
        );
      }
    }
  );
  

// ** Slice **
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.items;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch Cart Items
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.items;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update Cart Items Quantity
      .addCase(updateCartItemsQty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItemsQty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.items;
      })
      .addCase(updateCartItemsQty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete Cart Item
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.items;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer;
