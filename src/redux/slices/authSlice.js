import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  login,
  register,
  getProfile,
  updateProfile,
} from "../../services/authService";

// ---------- Helpers ----------
const getErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.data?.message) return err.response.data.data.message;
  return err.message || "Something went wrong";
};

// Build full URL for profile picture
const buildProfilePictureUrl = (filename) => {
  if (!filename) return null;
  // Already has full URL or starts with http
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  // Starts with /static/
  if (filename.startsWith("/")) {
    return (import.meta.env.VITE_API_URL || "") + filename;
  }
  // Just filename
  return (import.meta.env.VITE_API_URL || "") + "/static/profile_pictures/" + filename;
};

const normalizeUserData = (user) => {
  if (!user) return null;
  return {
    id: user.user_id || user.id,
    name: user.user_name || user.name,
    email: user.user_email || user.email,
    phone: user.user_phone || user.phone,
    address: user.user_address || user.address,
    user_role: user.user_role || user.role,
    role: user.user_role || user.role,
    profilePicture: buildProfilePictureUrl(user.user_profile_picture || user.profilePicture || null),
    user_profile_picture: user.user_profile_picture || user.profilePicture || null,
  };
};

const getStoredUser = () => {
  try {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (!u || !t) return { user: null, token: null };
    const parsed = JSON.parse(u);
    if (!parsed || typeof parsed !== "object") return { user: null, token: null };
    return { user: normalizeUserData(parsed), token: t };
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return { user: null, token: null };
  }
};

// Get initial state
const stored = getStoredUser();

const initialState = {
  user: stored.user,
  token: stored.token,
  loading: false,
  error: null,
  isInitialized: Boolean(stored.token && stored.user),
};

// ---------- Thunks ----------
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await login(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await register(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfile();
      return normalizeUserData(res.data);
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { rejectWithValue, getState }) => {
    try {
      const res = await updateProfile(data);
      // Backend returns response in format: { message, status, data: user_data }
      // The updateProfile API returns the full response, so we need to get data.data
      let userData = null;
      
      if (res.data && res.data.data) {
        // Backend returns data in res.data.data
        userData = res.data.data;
      } else if (res.data) {
        userData = res.data;
      }
      
      if (userData) {
        return normalizeUserData(userData);
      }
      
      // Fallback: get current user from state
      const currentUser = getState().auth.user;
      return currentUser;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// ---------- Slice ----------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = false;
      state.error = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfilePicture: (state, action) => {
      // Update profile picture directly in state (for immediate UI update)
      if (state.user) {
        state.user.profilePicture = buildProfilePictureUrl(action.payload);
        state.user.user_profile_picture = action.payload;
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;

        const responseData = action.payload;
        // Debug: log the raw login response payload
        try {
          console.debug("authSlice: loginUser.fulfilled payload:", responseData);
        } catch (e) {}
        
        let userData = null;
        let token = null;

        // Handle different response structures
        if (responseData.data) {
          userData = responseData.data.user || responseData.data;
          token = responseData.data.token || responseData.data.access_token || responseData.data.jwt;
        } else {
          userData = responseData.user || responseData;
          token = responseData.token || responseData.access_token || responseData.jwt;
        }

        const normalizedUser = normalizeUserData(userData);

        state.user = normalizedUser;
        state.token = token;
        state.isInitialized = true;
        if (token) {
          localStorage.setItem("token", token);
        }
        if (normalizedUser) {
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        }
        // mark login time to help avoid racey logout handling in other tabs/components
        try {
          localStorage.setItem("auth:loginAt", String(Date.now()));
        } catch (e) {}
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isInitialized = false;
        try {
          console.debug("authSlice: loginUser.rejected:", action.payload);
        } catch (e) {}
      })

      // UPDATE PROFILE
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const normalizedUser = normalizeUserData(action.payload);
        state.user = normalizedUser;
        if (normalizedUser) {
          localStorage.setItem("user", JSON.stringify(normalizedUser));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, updateProfilePicture } = authSlice.actions;
export default authSlice.reducer;

