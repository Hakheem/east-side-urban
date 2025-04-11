import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  isLoading: false,
  productList: [],
  error: null,
  productDetails: null,
};

// Fetch products
export const fetchFilteredProducts = createAsyncThunk(
  "products/fetch",
  async ({ filterParams, sortParams }, thunkAPI) => {
    try {
      const query = new URLSearchParams();

      // filters
      for (const [key, value] of Object.entries(filterParams)) {
        if (Array.isArray(value) && value.length > 0) {
          query.append(key, value.join(","));
        }
      }

      // sort parameter
      if (sortParams) {
        query.append("sortBy", sortParams);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/products/fetch?${query}` 
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message,
      });
    }
  }
);

// Fetch product details
export const fetchProductDetails = createAsyncThunk(
  "products/fetch-product-details",
  async (id, thunkAPI) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/products/get/${id}`  
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || error.message,
      });
    }
  }
);


// Slice
const shopProductsSlice = createSlice({
  name: "shopProducts",
  initialState,
  reducers: {
    setProductDetails : (state, action)=>{
      state.productDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilteredProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.products;
      })
      .addCase(fetchFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload || "Failed to fetch products.";
      })

      .addCase(fetchProductDetails.pending, (state) => {
        state.isLoading = true; 
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.product;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
        state.error = action.payload || "Failed to fetch product details.";
      });
  },
});


export const { setProductDetails } = shopProductsSlice.actions;
export default shopProductsSlice.reducer;
