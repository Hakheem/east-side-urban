import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/auth/auth";
import { Toaster } from "@/components/ui/toaster";

// Layouts
import AuthLayout from "./components/auth/layout";
import AdminLayout from "./components/admin-veiw/layout";
import ShopLayout from "./components/shopping-veiw/layout";

// Pages
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import AdminDashboard from "./pages/admin-veiw/dashboard";
import AdminProducts from "./pages/admin-veiw/products";
import AdminOrders from "./pages/admin-veiw/orders";
import AdminFeatures from "./pages/admin-veiw/features";
import Home from "./pages/shopping-veiw/home";
import Listing from "./pages/shopping-veiw/listing";
import Checkout from "./pages/shopping-veiw/checkout";
import Account from "./pages/shopping-veiw/account";
import PaypalReturn from "./pages/shopping-veiw/Paypal/PaypalReturn";
import PaypalCancel from "./pages/shopping-veiw/Paypal/PaypalCancel";
import PaymentSuccess from "./pages/shopping-veiw/Paypal/payment-success";
import PaymentFailure from "./pages/shopping-veiw/Paypal/payment-failure";
import SearchPage from "./pages/shopping-veiw/searchPage";
import NotFound from "./pages/not-found/notFound";
import Unauthorised from "./pages/unauthorised/Unauthorised";

// Utils
import CheckAuth from "./components/common/CheckAuth";
import CustomLoader from "./components/ui/loader";

function App() {
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    dispatch(checkAuth(token));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="m-auto">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Routes>

        {/* Public Shop Routes */}
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="listing" element={<Listing />} />
          <Route path="paypal-return" element={<PaypalReturn />} />
          <Route path="payment-success" element={<PaymentSuccess />} />
          <Route path="payment-failure" element={<PaymentFailure />} />
          <Route path="search" element={<SearchPage />} />

          {/* Protected shop routes */}
          <Route path="checkout" element={
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Checkout />
            </CheckAuth>
          } />
          <Route path="account" element={ 
            <CheckAuth isAuthenticated={isAuthenticated} user={user}>
              <Account />
            </CheckAuth>
          } />
        </Route>

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Admin Routes */}
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

        {/* Misc Routes */}
        <Route path="*" element={<NotFound />} />
        <Route path="unauthorised" element={<Unauthorised />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
