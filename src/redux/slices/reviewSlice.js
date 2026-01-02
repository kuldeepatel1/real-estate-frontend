import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as reviewService from "../../services/reviewService";

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
export const fetchReviewsByProperty = createAsyncThunk(
  "reviews/fetchByProperty",
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await reviewService.getPropertyReviews(propertyId);
      // Backend returns { data: { reviews: [...], stats: {...} } }
      const responseData = res.data?.data || res.data || {};
      return responseData.reviews || [];
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const addReview = createAsyncThunk(
  "reviews/add",
  async ({ property_id, rating, comment }, { rejectWithValue }) => {
    try {
      // Backend expects: { property_id, rating, comment }
      const payload = { property_id, rating, comment };
      const res = await reviewService.addReview(payload);
      return res.data?.data || res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearReviews: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviewsByProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload || [];
      })
      .addCase(fetchReviewsByProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        // Don't add to list since reviews need admin approval before showing
        // The backend sets is_approved = False by default
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;

