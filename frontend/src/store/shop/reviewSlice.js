import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    isLoading: false,
    reviews: [],
};

export const addNewReview = createAsyncThunk(
  'reviews/addNewReview',
  async (reviewData) => { 
    try {
      const response = await axios.post(
        'http://localhost:5000/api/reviews/add', 
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
      `http://localhost:5000/api/reviews/${productId}` 
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
            .addCase(getReviews.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.data;
            })
            .addCase(getReviews.rejected, (state) => {
                state.isLoading = false;
            })
            .addCase(addNewReview.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addNewReview.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addNewReview.rejected, (state) => {
                state.isLoading = false;
            });
    }
});

export default reviewSlice.reducer;