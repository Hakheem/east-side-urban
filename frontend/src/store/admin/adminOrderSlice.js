import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  orderList: [],
  orderDetails: null,
  error: null,
};

// Fetch all orders for the admin
export const getAllOrdersForAdmin = createAsyncThunk(
  "/order/get-orders-admin",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/admin/orders/admin-orders/");
      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Error fetching orders.",
      });
    }
  }
);

// Fetch a single order's details
export const getOrderDetailsForAdmin = createAsyncThunk(
  "/order/get-order-details-admin",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/admin/orders/admin-order-details/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Error fetching order details.",
      });
    }
  }
);

// Update order status
export const updateOrderStatusForAdmin = createAsyncThunk(
  "/order/update-order-status-admin",
  async ({ id, orderStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/orders/update-order-status/${id}`, {
        orderStatus,
      });

      return response.data
    } catch (error) {
      return rejectWithValue({
        status: error.response?.status || 500,
        message: error.response?.data?.message || "Error updating order status.",
      });
    }
  }
);

const adminOrderSlice = createSlice({
  name: "adminOrderSlice",
  initialState,
  reducers: {
    resetAdminOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Orders
      .addCase(getAllOrdersForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllOrdersForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderList = action.payload?.data || action.payload;
      })
      .addCase(getAllOrdersForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderList = [];
        state.error = action.payload;
      })

      // Get Order Details
      .addCase(getOrderDetailsForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrderDetailsForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderDetails = action.payload.data;
      })
      .addCase(getOrderDetailsForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.orderDetails = null;
        state.error = action.payload;
      })

      // Update Order Status
      .addCase(updateOrderStatusForAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusForAdmin.fulfilled, (state, action) => {
        state.isLoading = false;

        // Update order status in orderDetails
        if (state.orderDetails && state.orderDetails._id === action.payload.id) {
          state.orderDetails.orderStatus = action.payload.orderStatus;
        }

        // Update order status in orderList
        state.orderList = state.orderList.map((order) =>
          order._id === action.payload.id ? { ...order, orderStatus: action.payload.orderStatus } : order
        );
      })
      .addCase(updateOrderStatusForAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminOrderDetails } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
