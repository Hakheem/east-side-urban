import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  approvalUrl: null,
  isLoading: false,
  orderId: null,
  error: null,  
  orderList: [],
  orderDetails: null,
  currentOrder: null, // Added for better payment tracking
  paymentStatus: 'idle', // 'idle' | 'processing' | 'succeeded' | 'failed'
};

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/orders/create`, 
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Debugging log
      console.log('PayPal Order Response:', response.data);
      
      if (!response.data.approvalUrl) {
        throw new Error('No approval URL received from server');
      }
      
      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('Order Creation Error:', {
        config: error.config,
        response: error.response?.data,
        message: error.message
      });
      
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to create payment order',
        details: error.response?.data?.error || error.message
      });
    }
  }
);

export const capturePayment = createAsyncThunk(
  'orders/capturePayment',
  async ({ paymentId, orderId }, { rejectWithValue }) => {
    try {
      console.log('[Frontend] Attempting to capture payment:', { paymentId, orderId });
      
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/orders/capture`,
        { paymentId, orderId },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('[Frontend] Capture payment response:', data);
      
      if (!data.success) {
        console.error('[Frontend] Capture failed in API response:', data.message);
        throw new Error(data.message || 'Payment capture failed');
      }

      return {
        order: data.order,
        captureDetails: data.captureDetails
      };

    } catch (error) {
      console.error('[Frontend] Capture payment error:', {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      return rejectWithValue({
        message: error.response?.data?.message || 'Payment capture failed',
        details: error.response?.data?.error || error.message,
        status: error.response?.status || 500,
        paypalDebugId: error.response?.data?.paypalDebugId
      });
    }
  }
);

export const getAllOrdersByUserId = createAsyncThunk(
  'orders/getAllByUser',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/orders/list/${userId}`
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: 'Failed to fetch orders',
        details: error.message
      });
    }
  }
);

export const getOrderDetails = createAsyncThunk(
  'orders/getDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/orders/details/${orderId}`
      );
      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: 'Failed to fetch order details',
        details: error.message
      });
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrderState: (state) => {
      Object.assign(state, initialState);
    },
    resetOrderDetails: (state) => {
      state.orderDetails = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.paymentStatus = 'processing';
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.approvalUrl = action.payload.approvalUrl;
        state.orderId = action.payload.orderId;
        state.currentOrder = action.payload;
        state.paymentStatus = 'succeeded';
        sessionStorage.setItem('currentOrder', JSON.stringify(action.payload));
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Order creation failed',
          details: action.payload?.details
        };
        state.paymentStatus = 'failed';
      })

      // Capture Payment
      .addCase(capturePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.paymentStatus = 'processing';
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = 'succeeded';
        if (!state.orderList) state.orderList = [];
        state.orderList.push(action.payload.order);
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Payment capture failed',
          details: action.payload?.details
        };
        state.paymentStatus = 'failed';
      })

      // Get All Orders
      .addCase(getAllOrdersByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload.data || action.payload;
      })
      .addCase(getAllOrdersByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Failed to load orders',
          details: action.payload?.details
        };
      })

      // Get Order Details
      .addCase(getOrderDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data || action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Failed to load order details',
          details: action.payload?.details
        };
      });
  }
});

export const { 
  clearOrderState, 
  resetOrderDetails,
  setCurrentOrder 
} = orderSlice.actions;

export default orderSlice.reducer;