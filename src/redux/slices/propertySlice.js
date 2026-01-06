import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as propertyService from "../../services/propertyService";

// Helper function to extract error message
const getErrorMessage = (err) => {
  console.error("API Error:", err.response);
  if (err.response?.data?.message) return err.response.data.message;
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;
    return typeof errors === "object" ? Object.values(errors).flat().join(", ") : errors;
  }
  if (err.response?.statusText) return `${err.response.status}: ${err.response.statusText}`;
  return err.message || "An error occurred";
};

// Helper function to normalize property data
const normalizeProperty = (item) => ({
  _id: item.property_id ?? item._id,
  title: item.property_title ?? item.title,
  property_title: item.property_title ?? item.title,
  images: item.property_images ?? item.images ?? [],
  price: item.price ?? item.property_price,
  property_price: item.price ?? item.property_price,
  property_type: item.property_type,
  property_description: item.property_description ?? item.description,
  description: item.property_description ?? item.description,
  category_id: item.category_id,
  // Preserve location data from backend response
  location_id: item.location_id ? { ...item.location_id, city: item.city } : { city: item.city, location_id: item.location_id },
  // Preserve location_name and city from backend (top-level fields)
  location_name: item.location_name,
  city: item.city,
  status: item.property_status ?? item.status,
  property_status: item.property_status ?? item.status,
  // Additional fields needed for View modal
  year_built: item.year_built,
  address: item.address,
  bedrooms: item.bedrooms,
  bathrooms: item.bathrooms,
  area_sqft: item.area_sqft,
  parking_spots: item.parking_spots,
  has_garden: item.has_garden,
  has_pool: item.has_pool,
  pet_friendly: item.pet_friendly,
  furnished: item.furnished,
  is_featured: item.is_featured,
  raw: item,
});

// Async thunks
export const fetchProperties = createAsyncThunk(
  "properties/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await propertyService.getAllProperties(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  "properties/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.getPropertyById(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createProperty = createAsyncThunk(
  "properties/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await propertyService.addProperty(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateProperty = createAsyncThunk(
  "properties/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await propertyService.updateProperty(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteProperty = createAsyncThunk(
  "properties/delete",
  async (id, { rejectWithValue }) => {
    try {
      await propertyService.deleteProperty(id);
      return id;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

// Property status async thunks
export const markPropertyAsSold = createAsyncThunk(
  "properties/markAsSold",
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.markPropertySold(id);
      return { id, ...res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const markPropertyAsPending = createAsyncThunk(
  "properties/markAsPending",
  async (id, { rejectWithValue }) => {
    try {
      const res = await propertyService.markPropertyPending(id);
      return { id, ...res.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchSoldProperties = createAsyncThunk(
  "properties/fetchSold",
  async (_, { rejectWithValue }) => {
    try {
      const res = await propertyService.getSoldProperties();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const fetchPendingProperties = createAsyncThunk(
  "properties/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const res = await propertyService.getPendingProperties();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const propertySlice = createSlice({
  name: "properties",
  initialState: {
    list: [],
    currentProperty: null,
    soldProperties: [],
    pendingProperties: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update - update property status immediately in local state
    updatePropertyStatusOptimistic: (state, action) => {
      const { id, status } = action.payload;
      const property = state.list.find((p) => p._id === id);
      if (property) {
        property.status = status;
      }
      if (state.currentProperty?._id === id) {
        state.currentProperty.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        // backend wraps results in { status, message, data }
        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.properties)
          ? payload.properties
          : [];

        // normalize each item to the shape the UI expects
        state.list = rawList.map((item) => ({
          _id: item.property_id ?? item._id,
          title: item.property_title ?? item.title,
          property_title: item.property_title ?? item.title,
          images: item.property_images ?? item.images ?? [],
          price: item.price ?? item.property_price,
          property_price: item.price ?? item.property_price,
          property_type: item.property_type,
          property_description: item.property_description ?? item.description,
          description: item.property_description ?? item.description,
          category_id: item.category_id,
          location_id: item.location_id ? { ...item.location_id, city: item.city } : { city: item.city, location_id: item.location_id },
          // Preserve location_name and city from backend (top-level fields)
          location_name: item.location_name,
          city: item.city,
          status: item.property_status ?? item.status,
          property_status: item.property_status ?? item.status,
          // Additional fields needed for View modal
          year_built: item.year_built,
          address: item.address,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          area_sqft: item.area_sqft,
          parking_spots: item.parking_spots,
          has_garden: item.has_garden,
          has_pool: item.has_pool,
          pet_friendly: item.pet_friendly,
          furnished: item.furnished,
          is_featured: item.is_featured,
          raw: item,
        }));

        state.totalPages = (payload.data && payload.totalPages) || payload.totalPages || 1;
        state.currentPage = (payload.data && payload.currentPage) || payload.currentPage || 1;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchPropertyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const item = payload.data || payload;
        
        // Normalize category - handle both integer ID and object with category_name
        let normalizedCategoryId = item.category_id;
        if (typeof item.category_id === 'object' && item.category_id !== null) {
          normalizedCategoryId = item.category_id;
        } else if (item.category_name) {
          // If we have category_id as integer and category_name as string, create object
          normalizedCategoryId = {
            category_id: item.category_id,
            category_name: item.category_name
          };
        }
        
        // Normalize location - handle both integer ID and location details
        let normalizedLocationId = item.location_id;
        if (typeof item.location_id === 'object' && item.location_id !== null) {
          normalizedLocationId = item.location_id;
        } else {
          // Create location object with all available fields from backend
          normalizedLocationId = {
            location_id: item.location_id,
            location_name: item.location_name,
            city: item.city,
            address: item.address || item.location_id?.address
          };
        }
        
        state.currentProperty = {
          _id: item.property_id ?? item._id,
          title: item.property_title ?? item.title,
          property_title: item.property_title ?? item.title,
          description: item.property_description ?? item.description,
          property_description: item.property_description ?? item.description,
          images: item.property_images ?? item.images ?? [],
          price: item.price ?? item.property_price,
          property_price: item.price ?? item.property_price,
          property_type: item.property_type,
          category_id: normalizedCategoryId,
          category_name: item.category_name,
          location_id: normalizedLocationId,
          city: item.city, // Also keep city as top-level for easy access
          status: item.property_status ?? item.status,
          property_status: item.property_status ?? item.status,
          user_id: item.user_id,
          // Additional fields needed for PropertyDetails page
          year_built: item.year_built,
          address: item.address,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          area_sqft: item.area_sqft,
          parking_spots: item.parking_spots,
          has_garden: item.has_garden,
          has_pool: item.has_pool,
          pet_friendly: item.pet_friendly,
          furnished: item.furnished,
          is_featured: item.is_featured,
          raw: item,
        };
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.list)) state.list = [];
        state.list.push(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentProperty?._id === action.payload._id) {
          state.currentProperty = action.payload;
        }
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((p) => p._id !== action.payload);
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Sold
      .addCase(markPropertyAsSold.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPropertyAsSold.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        const property = state.list.find((p) => p._id === id);
        if (property) {
          property.status = 'sold';
          property.property_status = 'sold';
        }
      })
      .addCase(markPropertyAsSold.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Mark as Pending
      .addCase(markPropertyAsPending.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPropertyAsPending.fulfilled, (state, action) => {
        state.loading = false;
        const { id } = action.payload;
        const property = state.list.find((p) => p._id === id);
        if (property) {
          property.status = 'pending';
          property.property_status = 'pending';
        }
      })
      .addCase(markPropertyAsPending.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Sold Properties
      .addCase(fetchSoldProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSoldProperties.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : [];
        state.soldProperties = rawList.map(normalizeProperty);
      })
      .addCase(fetchSoldProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Pending Properties
      .addCase(fetchPendingProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingProperties.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : [];
        state.pendingProperties = rawList.map(normalizeProperty);
      })
      .addCase(fetchPendingProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentProperty, clearError, updatePropertyStatusOptimistic } = propertySlice.actions;
export default propertySlice.reducer;

