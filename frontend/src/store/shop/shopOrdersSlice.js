import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  approvalUrl: null,
  isLoading: false,
  orderId: null,
  error: null,  // Adding error field to store errors globally
};

export const createOrder = createAsyncThunk(
  '/order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/orders/create', orderData);
      return response.data;
    } catch (error) {
      // Use rejectWithValue to pass error message or status
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

export const capturePayment = createAsyncThunk(
  '/order/capturePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/orders/capture', paymentData);
      return response.data;
    } catch (error) {
      // Use rejectWithValue to pass error message or status
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const orderSlice = createSlice({
  name: 'orderSlice',
  initialState,
  reducers: {
    clearOrderState: (state) => {
      state.approvalUrl = null;
      state.orderId = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalUrl = action.payload.approvalUrl;
        state.orderId = action.payload.orderId;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.approvalUrl = null;
        state.orderId = null;
        // Store the error message if the order creation fails
        state.error = action.payload || "Error creating order";
      })
      // Handle capturePayment
      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Assuming 'orders' exists and should hold the successful order
        state.orders = state.orders || [];  // Initialize if it's undefined
        state.orders.push(action.payload.order);
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        // Capture error for payment
        state.error = action.payload || "Error capturing payment";
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
