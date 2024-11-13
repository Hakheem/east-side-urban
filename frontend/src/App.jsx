import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import AuthLayout from "./components/auth/layout";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import AdminLayout from "./components/admin-veiw/layout";
import AdminDashboard from "./pages/admin-veiw/dashboard";
import AdminProducts from "./pages/admin-veiw/products";
import AdminOrders from "./pages/admin-veiw/orders";
import AdminFeatures from "./pages/admin-veiw/features";
import ShopLayout from "./components/shopping-veiw/layout";
import NotFound from "./pages/not-found/notFound";
import Home from "./pages/shopping-veiw/home";
import Listing from "./pages/shopping-veiw/listing";
import Checkout from "./pages/shopping-veiw/checkout";
import Account from "./pages/shopping-veiw/account";
import CheckAuth from "./components/common/CheckAuth";
import Unauthorised from "./pages/unauthorised/Unauthorised";
import { useSelector } from "react-redux";

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="flex flex-col bg-white">
      <Routes>
        {/* auth routes */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AuthLayout />
            </CheckAuth>
          }
        >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        {/* admin routes */}
        <Route
          path="/admin"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="features" element={<AdminFeatures />} />
        </Route>
        {/* shop routes */}
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <ShopLayout />
            </CheckAuth>
          } 
        >
          <Route path="home" element={<Home />} />
          <Route path="listing" element={<Listing />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path="unauthorised" element={<Unauthorised />} />
      </Routes>
    </div>
  );
}

export default App;
