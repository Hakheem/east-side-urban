import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  isLoading: false,
  featureImageList: [],
};

export const fetchFeatureImages = createAsyncThunk(
  'feature/fetchImages', 
  async () => {
    const response = await axios.get(`http://localhost:5000/api/common/features/get`);
    return response.data;
  }
);

export const addFeatureImages = createAsyncThunk(
  'feature/addFeatureImages',
  async ({ image }) => {
    const response = await axios.post(`http://localhost:5000/api/common/features/add`, { image });
    return response.data;
  }
);

const featuresSlice = createSlice({
  name: 'featuresSlice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.images; 
      })
      .addCase(fetchFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      });
  }
});

export default featuresSlice.reducer;
