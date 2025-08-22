import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowLeft,
  FileText,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

const PaystackOrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Expecting state from redirect: order, paymentDetails, reference, paymentMethod
  const { order, paymentDetails, reference } = location.state || {};

  if (!order || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center"
        >
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Information Missing
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order details. Please check your orders page
            or contact support if this issue persists.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/account")}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
            >
              Go to My Orders
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="py-3 rounded-lg font-medium"
            >
              Return Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Format currency based on payment details
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full"
      >
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6"
          >
            <CheckCircle className="h-10 w-10 text-green-600" />
          </motion.div>

          <h1 className="text-3xl font-bold text-green-800 mb-3">
            Payment Successful.
          </h1>
          <p className="text-gray-600 text-lg">
            Your order has been confirmed. Thank you for shopping with us.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium text-gray-900">
                {order.id || order._id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Amount Paid</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Payment Reference</p>
              <p className="font-medium text-gray-900 break-all">{reference}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-green-600 capitalize">
                {paymentDetails.status}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Paid At</p>
              <p className="font-medium text-gray-900">
                {new Date(paymentDetails.paid_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/account")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <FileText className="h-5 w-5" />
            View Order Details
          </Button>

          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaystackOrderSuccess;
