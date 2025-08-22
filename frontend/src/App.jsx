import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./store/auth/auth";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";

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
import OrderSuccess from "./pages/shopping-veiw/Paypal/Cod-success";
import PaystackCallback from "./components/shopping-veiw/PaystackCallback";
import PaystackOrderSuccess from "./pages/shopping-veiw/paystack/order-success";

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth());
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
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public Shop Routes */}
          <Route path="/" element={<ShopLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<Home />} />
            <Route path="listing" element={<Listing />} />
            <Route path="paypal-return" element={<PaypalReturn />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-failure" element={<PaymentFailure />} />
            <Route path="cod-order-success" element={<OrderSuccess />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="/paystack-callback" element={<PaystackCallback />} />
            <Route path="/paystack-order-success" element={<PaystackOrderSuccess />} />

            {/* Protected shop routes */}
            <Route
              path="checkout"
              element={
                <CheckAuth>
                  <Checkout /> 
                </CheckAuth>
              }
            />
            <Route
              path="account"
              element={
                <CheckAuth>
                  <Account />
                </CheckAuth>
              }
            />
          </Route>

          {/* Auth Routes - Only accessible to guests */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route
              path="login"
              element={
                <CheckAuth guestAllowed>
                  <Login />
                </CheckAuth>
              }
            />
            <Route
              path="register"
              element={
                <CheckAuth guestAllowed>
                  <Register />
                </CheckAuth>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <CheckAuth roles={["admin"]}>
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
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default App;
