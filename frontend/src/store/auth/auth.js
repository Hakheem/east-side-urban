import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  isGuest: true,
  user: null,
  isLoading: true,
  error: null,
};

// Enhanced axios instance with credentials for cookie handling
const createAuthenticatedRequest = () => {
  return {
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
  };
};

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/auth/google`,
        { credential: credentialResponse.credential },
        createAuthenticatedRequest()
      );

      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || "Google login failed",
      };
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL_API}/api/auth/register`,
        formData,
        createAuthenticatedRequest()
      );
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }
);

export const loginUser = createAsyncThunk("auth/login", async (formData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_URL_API}/api/auth/login`,
      formData,
      createAuthenticatedRequest()
    );

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw {
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
      createAuthenticatedRequest()
    );
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    // Don't throw error on logout - always clear local state
    return { success: true, message: "Logged out locally" };
  }
});

// Simplified checkAuth - relies entirely on HTTP-only cookies
export const checkAuth = createAsyncThunk("auth/checkauth", async () => {
  try {
    console.log("[AUTH] Checking authentication status...");

    const response = await axios.get(
      `${import.meta.env.VITE_URL_API}/api/auth/check-auth`,
      createAuthenticatedRequest()
    );

    console.log("[AUTH] checkAuth response:", response.data);
    return response.data;
  } catch (error) {
    console.log("[AUTH] checkAuth failed:", error.response?.data?.message || error.message);
    return { success: false, isGuest: true };
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.isGuest = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isGuest = false;
          state.error = null;
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.isGuest = true;
          state.error = action.payload.message;
        }
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isGuest = true;
        state.error = action.error.message || "Google login failed";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Registration failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isGuest = false;
          state.error = null;
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.isGuest = true;
          state.error = action.payload.message;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.isGuest = true;
        state.error = action.error.message || "Login failed";
      })

      // Check Authentication - Simplified for cookie-based auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success) {
          console.log("[AUTH] Auth check successful, setting user:", action.payload.user);
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.isGuest = false;
          state.error = null;
        } else {
          console.log("[AUTH] Auth check failed, setting guest state");
          state.isAuthenticated = false;
          state.isGuest = true;
          state.user = null;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        console.log("[AUTH] Auth check rejected:", action.error);
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isGuest = true;
        state.user = null;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isGuest = true;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Still clear auth state even if server logout failed
        state.user = null;
        state.isAuthenticated = false;
        state.isGuest = true;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;

