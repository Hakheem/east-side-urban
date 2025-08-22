import { CheckCircle2, ShoppingBag, Home, User, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/shop/cartSlice";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { state } = location;

  // Extract order details with fallbacks
  const order = {
    id: state?.orderId || "N/A",
    date: state?.date || new Date().toISOString(),
    total: state?.orderTotal || 0,
    paymentMethod: state?.paymentMethod || "cod",
    items: state?.cartItems || [],
  };

  // Format date nicely
  const formattedDate = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Clear cart on mount for COD orders
  useEffect(() => {
    if (order.paymentMethod === "cod") {
      dispatch(clearCart());
    }
  }, [dispatch, order.paymentMethod]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Animated Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <CheckCircle2 className="h-24 w-24 text-green-500" />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-green-100 opacity-60 -z-10"
            />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {order.paymentMethod === "paypal"
              ? "Payment Successful!"
              : "Order Confirmed!"}
          </h1>
          <p className="text-lg text-gray-600">
            {order.paymentMethod === "paypal"
              ? `Your payment of ${order.total.toLocaleString()} Ksh has been processed.`
              : `Your order for ${order.total.toLocaleString()} Ksh has been received.`}
          </p>
          <p className="text-gray-500 mt-2">
            Order #{order.id} • {formattedDate}
          </p>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Package className="h-4 w-4 mr-1" />
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </div>
          </div>

          <div className="space-y-4">
            {order.items.slice(0, 3).map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center"
              >
                <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border border-gray-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × {item.price.toLocaleString()} Ksh
                  </p>
                </div>
              </motion.div>
            ))}

            {order.items.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-sm text-gray-500 pt-2"
              >
                + {order.items.length - 3} more items
              </motion.div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>{order.total.toLocaleString()} Ksh</p>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-10"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            What's Next?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery Preparation"
                    : "Order Processing"}
                </p>
                <p className="text-sm text-gray-500">
                  {order.paymentMethod === "cod"
                    ? "We'll contact you to arrange delivery and payment"
                    : "Your order is being prepared for shipment"}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  Confirmation Sent
                </p>
                <p className="text-sm text-gray-500">
                  We've sent order details to your email
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => navigate("/account")}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
          >
            <User className="h-5 w-5 mr-2" />
            View My Orders
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1 h-12"
          >
            <Home className="h-5 w-5 mr-2" />
            Continue Shopping
          </Button>
        </motion.div>

        {/* Delivery Note for COD */}
        {order.paymentMethod === "cod" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800"
          >
            <p className="font-medium">Cash on Delivery Note:</p>
            <p>
              Please have exact amount ready (Ksh {order.total.toLocaleString()}
              ) when our delivery agent arrives.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderSuccess;
