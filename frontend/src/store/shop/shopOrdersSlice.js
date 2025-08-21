import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  approvalUrl: null,
  isLoading: false,
  orderId: null,
  error: null,  
  orderList: [],
  orderDetails: null,
  currentOrder: null,
  paymentStatus: 'idle',
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

      console.log('Order Creation Response:', response.data);

      // Validate response structure
      if (!response.data || !response.data.orderId) {
        throw new Error('Invalid order response from server');
      }

      // Handle COD orders
      if (orderData.paymentMethod === 'cod') {
        return {
          type: 'cod',
          orderId: response.data.orderId,
          orderDate: response.data.orderDate || new Date().toISOString(),
          success: true
        };
      }

      // Handle PayPal orders
      if (orderData.paymentMethod === 'paypal') {
        const paymentUrl = response.data.approvalUrl || response.data.paymentUrl;
        if (!paymentUrl) {
          throw new Error('PayPal payment URL missing');
        }
        return {
          type: 'paypal',
          orderId: response.data.orderId,
          approvalUrl: paymentUrl,
          paymentUrl: paymentUrl,
          success: true
        };
      }

      // Handle Paystack orders
      if (orderData.paymentMethod === 'paystack') {
        const paymentUrl = response.data.paymentUrl;
        if (!paymentUrl) {
          throw new Error('Paystack payment URL missing');
        }
        return {
          type: 'paystack',
          orderId: response.data.orderId,
          paymentUrl: paymentUrl,
          reference: response.data.reference,
          success: true
        };
      }

      throw new Error(`Unsupported payment method: ${orderData.paymentMethod}`);

    } catch (error) {
      console.error('Order Creation Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      return rejectWithValue({
        message: error.response?.data?.message || error.message,
        code: error.response?.status || 500,
        paymentMethod: orderData.paymentMethod,
        isPaypalError: orderData.paymentMethod === 'paypal',
        isCodError: orderData.paymentMethod === 'cod',
        isPaystackError: orderData.paymentMethod === 'paystack'
      });
    }
  }
);

// New thunk for verifying Paystack payment
export const verifyPaystackPayment = createAsyncThunk(
  'orders/verifyPaystackPayment',
  async ({ reference, orderId }, { rejectWithValue }) => {
    try {
      console.log('[Frontend] Verifying Paystack payment:', { reference, orderId });
      
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL_API}/api/orders/paystack/verify/${reference}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('[Frontend] Paystack verification response:', data);
      
      if (!data.success) {
        console.error('[Frontend] Verification failed in API response:', data.message);
        throw new Error(data.message || 'Payment verification failed');
      }

      return {
        order: data.data.order,
        paymentDetails: {
          reference: data.data.reference,
          amount: data.data.amount,
          currency: data.data.currency,
          status: data.data.status,
          paid_at: data.data.paid_at
        }
      };

    } catch (error) {
      console.error('[Frontend] Paystack verification error:', {
        message: error.message,
        response: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      return rejectWithValue({
        message: error.response?.data?.message || 'Payment verification failed',
        details: error.response?.data?.error || error.message,
        status: error.response?.status || 500,
        reference: reference
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
        captureDetails: data.captureDetails,
        paypalDebugId: data.paypalDebugId
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
    },
    setPaymentReference: (state, action) => {
      state.paymentReference = action.payload;
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
        state.approvalUrl = action.payload.approvalUrl || action.payload.paymentUrl;
        state.orderId = action.payload.orderId;
        state.paymentReference = action.payload.reference;
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

      // Verify Paystack Payment
      .addCase(verifyPaystackPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.paymentStatus = 'processing';
      })
      .addCase(verifyPaystackPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = 'succeeded';
        if (!state.orderList) state.orderList = [];
        state.orderList.push(action.payload.order);
      })
      .addCase(verifyPaystackPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = {
          message: action.payload?.message || 'Payment verification failed',
          details: action.payload?.details
        };
        state.paymentStatus = 'failed';
      })

      // Capture Payment (PayPal)
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
  setCurrentOrder,
  setPaymentReference
} = orderSlice.actions;

export default orderSlice.reducer;
