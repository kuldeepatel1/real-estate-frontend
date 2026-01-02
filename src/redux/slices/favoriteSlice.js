import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as favoriteService from "../../services/favoriteService";

const getErrorMessage = (err) => {
  console.error("API Error:", err.response);
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;
    return typeof errors === "object" ? Object.values(errors).flat().join(", ") : errors;
  }
  return err.message || "An error occurred";
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await favoriteService.getFavorites();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addToFavorites = createAsyncThunk(
  "favorites/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await favoriteService.addFavorite(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  "favorites/remove",
  async (id, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.list = payload;
        } else if (Array.isArray(payload?.data)) {
          state.list = payload.data;
        } else {
          state.list = [];
        }
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.list)) state.list = [];
        state.list.push(action.payload);
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((f) => f._id !== action.payload);
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = favoriteSlice.actions;
export default favoriteSlice.reducer;

