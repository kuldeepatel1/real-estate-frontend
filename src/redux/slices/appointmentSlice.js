import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as appointmentService from "../../services/appointmentService";

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
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await appointmentService.getAppointments();
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const bookAppointment = createAsyncThunk(
  "appointments/book",
  async (data, { rejectWithValue }) => {
    try {
      const res = await appointmentService.addAppointment(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  "appointments/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await appointmentService.updateAppointment(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const appointmentSlice = createSlice({
  name: "appointments",
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
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        let appointmentsData = [];
        if (Array.isArray(payload)) {
          appointmentsData = payload;
        } else if (Array.isArray(payload?.data)) {
          appointmentsData = payload.data;
        } else {
          state.list = [];
          return;
        }
        // Normalize data: convert appointment_id to _id and appointment_status to status
        state.list = appointmentsData.map(apt => ({
          ...apt,
          _id: apt.appointment_id,
          status: apt.appointment_status
        }));
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        if (!Array.isArray(state.list)) state.list = [];
        state.list.push(action.payload);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError } = appointmentSlice.actions;

// Export async thunk for backward compatibility
export const updateAppointment = updateAppointmentStatus;

// Export reducer
export default appointmentSlice.reducer;

