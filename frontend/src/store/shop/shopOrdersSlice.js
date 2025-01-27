import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  approvalUrl: null,
  isLoading: false,
  orderId: null,
  error: null,  
  orderList: [],
  orderDetails: null,
};

export const createOrder = createAsyncThunk(
  '/order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/orders/create', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


export const capturePayment = createAsyncThunk(
  '/order/capturePayment',
  async ({ paymentId, payerId, orderId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`http://localhost:5000/api/orders/capture`, {
        paymentId,
        payerId,
        orderId,
      });

      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Error capturing payment.',
      });
    }
  }
);


export const getAllOrdersByUserId = createAsyncThunk(
  '/order/get-orders',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/orders/list/${userId}`
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message ,
      });
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  '/order/get-order-details',
  async (id, { rejectWithValue }) => {
    try {

      const { data } = await axios.get(`http://localhost:5000/api/orders/details/${id}`
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Error capturing payment.',
      });
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
    },
    resetOrderDetails:(state, action)=>{
state.orderDetails = null;
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
        sessionStorage.setItem('currentOrderId', JSON.stringify(action.payload.orderId ))
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.approvalUrl = null;
        state.orderId = null;
        state.error = action.payload || "Error creating order";
      })
      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders || [];  
        state.orders.push(action.payload.order);
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Error capturing payment";
      })
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload?.data || action.payload; 
      })
      .addCase(getAllOrdersByUserId.rejected, (state) => {
        state.isLoading = false;
        state.orderList = [] ;
      })

      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data ;
      })
      .addCase(getOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.orderDetails = null ;
      })
  },
});

export const { clearOrderState } = orderSlice.actions;
export const { resetOrderDetails } = orderSlice.actions;
export default orderSlice.reducer;
