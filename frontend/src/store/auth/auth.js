import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = { 
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  tokenInMemory: null,
};

export const registerUser = createAsyncThunk("auth/register", async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_URL_API}/api/auth/register`,
    formData,
    { withCredentials: true }
  );
  return response.data;
});

export const loginUser = createAsyncThunk("auth/login", async (formData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_URL_API}/api/auth/login`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("✅ Login successful, token:", response.data.token);
    return {
      ...response.data,
      tokenInMemory: response.data.token,
    };
  } catch (error) {
    console.error("❌ Login failed", error.response?.data);
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_URL_API}/api/auth/logout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Logout failed",
    };
  }
});

export const checkAuth = createAsyncThunk("auth/checkauth", async (_, { getState }) => {
  try {
    const token = getState().auth.tokenInMemory;
    const response = await axios.get(
      `${import.meta.env.VITE_URL_API}/api/auth/check-auth`,
      {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  } catch (error) {
    return { success: false };
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokenInMemory = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          console.log("✅ Login payload:", action.payload);
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.tokenInMemory = action.payload.tokenInMemory;
        } else {
          console.warn("⚠️ Login unsuccessful:", action.payload.message);
          state.user = null;
          state.isAuthenticated = false;
          state.error = action.payload.message;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.error("❌ Login request failed");
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokenInMemory = null;
        state.error = action.payload?.message || "Login failed";
      })

      // Check Authentication
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          console.log("✅ Auth check success:", action.payload.user);
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          console.warn("⚠️ Auth check failed");
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        console.warn("⚠️ Auth check rejected");
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("👋 Logged out");
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.tokenInMemory = null;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
 