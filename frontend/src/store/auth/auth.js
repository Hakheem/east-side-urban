import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  tokenInMemory: null, // For temporary storage during session
};

// Async action to REGISTER user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData) => {
    const response = await axios.post(
      `${import.meta.env.VITE_URL_API}/api/auth/register`,
      formData,
      { withCredentials: true }
    );
    return response.data;
  }
);

// Async action to LOGIN user
export const loginUser = createAsyncThunk("auth/login", async (formData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_URL_API}/api/auth/login`,
      formData,
      { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return {
      ...response.data,
      tokenInMemory: response.data.token // Temporary storage
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
});

// Async action to LOGOUT user
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

// Async action to CHECK authentication
export const checkAuth = createAsyncThunk("auth/checkauth", async (_, { getState }) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_URL_API}/api/auth/check-auth`,
      { 
        withCredentials: true,
        headers: {
          ...(getState().auth.tokenInMemory ? {
            Authorization: `Bearer ${getState().auth.tokenInMemory}`
          } : {})
        }
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
    }
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Registration failed";
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.tokenInMemory = action.payload.tokenInMemory;
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.error = action.payload.message;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.tokenInMemory = null;
        state.error = action.payload?.message || "Login failed";
      });

    // Check Authentication
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false; 
        state.user = null;
        state.isAuthenticated = false;
        state.tokenInMemory = null;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;