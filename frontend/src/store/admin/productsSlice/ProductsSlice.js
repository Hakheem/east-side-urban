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
        "http://localhost:5000/api/admin/products/add",
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
export const fetchProducts = createAsyncThunk("/products/fetch", async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/admin/products/fetch"
    );
    return response.data;
  } catch (error) {
    return { error: error.response?.data || error.message };
  }
});

// Edit Product
export const editProduct = createAsyncThunk(
  "/products/edit",
  async ({ id, formData }) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/products/edit/${id}`,
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
        `http://localhost:5000/api/admin/products/delete/${id}`
      );
      return response.data;
    } catch (error) {
      return { error: error.response?.data || error.message };
    }
  }
);

// slices
const adminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add New Product
      // .addCase(addNewProduct.pending, (state) => {
      //   state.isLoading = true;
      // })
      // .addCase(addNewProduct.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   state.productList.push(action.payload);
      // })
      // .addCase(addNewProduct.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.error.message;
      // })
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isLoading = false;
        state.productList = action.payload.data;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.error.message;
      })
      // Edit Product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.productList.findIndex(
          (product) => product.id === action.payload.id
        );
        if (index !== -1) {
          state.productList[index] = action.payload;
        }
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = state.productList.filter(
          (product) => product.id !== action.payload.id
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export default adminProductsSlice.reducer;
