import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth";
import adminProductsSlice from "./admin/ProductsSlice";
import shopProductsSlice from "./shop/shopProductsSlice";
import cartSlice from './shop/cartSlice'
import addressSlice from './shop/addressSlice';
import shopOrdersSlice from './shop/shopOrdersSlice';
import adminOrderSlice from "./admin/adminOrderSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    adminProducts: adminProductsSlice,
    shopProducts: shopProductsSlice,
    shopCart : cartSlice,
    addresses: addressSlice,
    shopOrder : shopOrdersSlice,
    adminOrder : adminOrderSlice, 
  },
});

export default store;
 