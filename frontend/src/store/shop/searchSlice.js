// searchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  products: [], // Changed from searchResults to products for clarity
  error: null
};

export const fetchSearchResults = createAsyncThunk( // Renamed from searchResults
  'search/fetchResults',
  async (keyword) => {
    const response = await axios.get(`http://localhost:5000/api/search/${keyword}`);
    return response.data;
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => { // Renamed from resetSearchResults
      state.products = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.products; // Match the backend response
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;