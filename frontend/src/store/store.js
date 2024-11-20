import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import adminProductsSlice from "./admin/productsSlice/ProductsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
  },
});

export default store;
