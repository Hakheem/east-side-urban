import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import adminProductsSlice from "./admin/productsSlice/ProductsSlice";
import shopProductsSlice from "./shop/shopProductsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
    shopProducts: shopProductsSlice,
  },
});

export default store;
