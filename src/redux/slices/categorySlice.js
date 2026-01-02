import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as categoryService from "../../services/categoryService";

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
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryService.getAllCategories();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await categoryService.addCategory(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await categoryService.updateCategory(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
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
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        if (Array.isArray(payload)) {
          state.list = payload;
        } else if (Array.isArray(payload?.data)) {
          state.list = payload.data;
        } else if (Array.isArray(payload?.categories)) {
          state.list = payload.categories;
        } else {
          state.list = [];
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // If server returned full list or wrapped list, replace state.list
        if (Array.isArray(payload)) {
          state.list = payload;
        } else if (Array.isArray(payload?.data)) {
          state.list = payload.data;
        } else if (Array.isArray(payload?.categories)) {
          state.list = payload.categories;
        } else {
          // Otherwise try to extract the created category object and append it
          const newCat = payload?.data || payload?.category || payload;
          if (!Array.isArray(state.list)) state.list = [];
          state.list.push(newCat);
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        try {
          // eslint-disable-next-line no-console
          console.debug("categorySlice: deleteCategory.fulfilled payload:", payload);
        } catch (e) {}
        // payload might be the id string, or an object containing the deleted item
        const deletedId =
          typeof payload === "string" || typeof payload === "number"
            ? String(payload)
            : payload?._id || payload?.id || (payload?.data?._id || payload?.data?.id) || null;
        if (deletedId) {
          state.list = state.list.filter((c) => String(c._id) !== deletedId && String(c.id) !== deletedId);
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        try {
          // eslint-disable-next-line no-console
          console.error("categorySlice: deleteCategory.rejected:", action.payload);
        } catch (e) {}
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;

