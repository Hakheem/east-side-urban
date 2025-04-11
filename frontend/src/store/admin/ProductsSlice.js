import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  productList: [],
  error: null,
};

// Add New Product
export const addNewProduct = createAsyncThunk(
  "/products/add-new",
  async (formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/admin/products/add`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
);

// Fetch Products
export const fetchProducts = createAsyncThunk(
  "/products/fetch",
  async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/api/admin/products/fetch`);
      return response.data; 
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
);

// Edit Product
export const editProduct = createAsyncThunk(
  "/products/edit",
  async ({ id, formData }) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_URL_API}/api/admin/products/edit/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; 
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
);

// Delete Product
export const deleteProduct = createAsyncThunk(
  "/products/delete",
  async (id) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_URL_API}/api/admin/products/delete/${id}`
      );
      return response.data; 
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
);

const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.error.message;
      });
  },
});

export default adminProductsSlice.reducer;
