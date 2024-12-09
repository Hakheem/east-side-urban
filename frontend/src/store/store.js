import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import adminProductsSlice from "./admin/productsSlice/ProductsSlice";
import shopProductsSlice from "./shop/shopProductsSlice";
import cartSlice from './shop/cartSlice'
import addressSlice from './shop/addressSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
    shopProducts: shopProductsSlice,
    shopCart : cartSlice,
    addresses: addressSlice,
  },
});

export default store;
 