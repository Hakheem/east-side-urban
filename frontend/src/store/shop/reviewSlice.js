import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,  
};

export const addNewReview = createAsyncThunk(
  'reviews/addNewReview',
  async (reviewData) => { 
    try { 
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/reviews/add`,  
        reviewData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
);

export const getReviews = createAsyncThunk(
  'reviews/getReviews',
  async (productId) => {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_API}/api/reviews/${productId}`
    );
    return response.data;
  }
);

const reviewSlice = createSlice({
  name: 'reviewSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message; 
      })

      // Add new review
      .addCase(addNewReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews.push(action.payload);
      })
      .addCase(addNewReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message; 
      });
  }
});

export default reviewSlice.reducer;
