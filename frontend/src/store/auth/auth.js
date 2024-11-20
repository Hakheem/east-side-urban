import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true, 
  error: null,
};

// Async action to REGISTER user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData) => {
    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }
);

// Async action to LOGIN user
export const loginUser = createAsyncThunk("auth/login", async (formData) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/login",
      formData,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An unexpected error occurred",
    };
  }
});


// Async action to LOGOUT user
export const logoutUser = createAsyncThunk("auth/logout", async (formData) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/auth/logout",{}, 
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "An unexpected error occurred",
    };
  }
});


// Async action to check user authentication
export const checkAuth = createAsyncThunk("auth/checkauth", async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/auth/check-auth",
      {
        withCredentials: true,
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
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
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
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || "Login failed";
      });

    // Check Authentication
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.error.message || "User is unauthorized";
      }) 
      // logout
       .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
          state.user = null;
          state.isAuthenticated = false;
        
      });
      
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
