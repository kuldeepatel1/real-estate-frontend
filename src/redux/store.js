import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import propertyReducer from "./slices/propertySlice";
import categoryReducer from "./slices/categorySlice";
import locationReducer from "./slices/locationSlice";
import appointmentReducer from "./slices/appointmentSlice";
import favoriteReducer from "./slices/favoriteSlice";
import reviewReducer from "./slices/reviewSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    categories: categoryReducer,
    locations: locationReducer,
    appointments: appointmentReducer,
    favorites: favoriteReducer,
    reviews: reviewReducer,
  },
});
