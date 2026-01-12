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

// Helper to get property ID from favorite object
const getPropertyId = (favorite) => {
  return favorite.property_id || favorite.propertyId || favorite.property?.property_id || favorite.property?._id || null;
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
  async ({ property_id }, { rejectWithValue, getState }) => {
    try {
      const res = await favoriteService.addFavorite({ property_id });
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  "favorites/remove",
  async (property_id, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(property_id);
      return property_id;
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
    // Map for O(1) lookup of favorite status by property_id
    favoritesByPropertyId: {},
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Reset favorites state (useful for logout)
    resetFavorites: (state) => {
      state.list = [];
      state.favoritesByPropertyId = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        const favoritesArray = Array.isArray(payload) 
          ? payload 
          : Array.isArray(payload?.data) ? payload.data : [];
        
        state.list = favoritesArray;
        
        // Build the lookup map for O(1) property status checks
        state.favoritesByPropertyId = {};
        favoritesArray.forEach((fav) => {
          const propId = getPropertyId(fav);
          if (propId) {
            state.favoritesByPropertyId[propId] = true;
          }
        });
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to Favorites - Optimistic Update
      .addCase(addToFavorites.pending, (state, action) => {
        const propertyId = action.meta.arg.property_id;
        state.loading = true;
        state.error = null;
        // Optimistically add to state
        if (propertyId && !state.favoritesByPropertyId[propertyId]) {
          state.favoritesByPropertyId[propertyId] = true;
          state.list.push({
            property_id: propertyId,
            _id: `temp_${propertyId}`,
          });
        }
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (!payload) return;

        const newPropertyId = getPropertyId(payload);
        
        // Remove any temporary entry and add the real one
        if (newPropertyId) {
          state.list = state.list.filter((f) => f.property_id !== newPropertyId || f._id?.startsWith('temp_'));
          state.favoritesByPropertyId[newPropertyId] = true;
          state.list.push({
            ...payload,
            property_id: newPropertyId,
          });
        }
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Revert optimistic update on failure would require storing previous state
        // For now, we just show the error - user can refresh
      })
      
      // Remove from Favorites - Optimistic Update
      .addCase(removeFromFavorites.pending, (state, action) => {
        const propertyId = action.meta.arg;
        state.loading = true;
        state.error = null;
        // Optimistically remove from state
        if (propertyId) {
          state.favoritesByPropertyId[propertyId] = false;
          state.list = state.list.filter((f) => {
            const favPropId = getPropertyId(f);
            return favPropId !== propertyId;
          });
        }
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        // Property already removed in pending, just clear loading
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Re-fetch to sync state on failure
      });
  },
});

export const { clearError, resetFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;

