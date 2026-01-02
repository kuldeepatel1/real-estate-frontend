import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as locationService from "../../services/locationService";

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
export const fetchLocations = createAsyncThunk(
  "locations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await locationService.getAllLocations();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createLocation = createAsyncThunk(
  "locations/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await locationService.addLocation(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateLocation = createAsyncThunk(
  "locations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await locationService.updateLocation(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteLocation = createAsyncThunk(
  "locations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await locationService.deleteLocation(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const locationSlice = createSlice({
  name: "locations",
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
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.list = payload;
        } else if (payload && Array.isArray(payload.data)) {
          state.list = payload.data;
        } else if (payload && Array.isArray(payload.locations)) {
          state.list = payload.locations;
        } else {
          state.list = [];
        }
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (!payload) return;
        if (!Array.isArray(state.list)) {
          state.list = Array.isArray(payload) ? payload : [payload];
          return;
        }
        if (Array.isArray(payload)) {
          state.list = state.list.concat(payload);
        } else {
          state.list.push(payload);
        }
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((l) => l._id !== action.payload);
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = locationSlice.actions;
export default locationSlice.reducer;

