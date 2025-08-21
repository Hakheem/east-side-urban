import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Address from "./address";
import CartContents from "@/components/shopping-veiw/cartContents";
import { Button } from "@/components/ui/button";
import images from "@/assets/assets";
import { createOrder, capturePayment } from "@/store/shop/shopOrdersSlice";
import { useToast } from "@/hooks/use-toast";
import DissolvingBanner from "@/components/common/DissolvingBanner";
import { fetchCartItems, clearCart } from "@/store/shop/cartSlice";
import { motion, AnimatePresence } from "framer-motion";

const Checkout = () => {
  const bannerImages = [
    images.account,
    images.accesoriesHeader,
    images.cover_photo,
  ];

  // Redux and Router Hooks
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Selectors
  const { productList } = useSelector((state) => state.shopProducts);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalUrl, orderId } = useSelector((state) => state.shopOrder);

  // State
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [showCodConfirmation, setShowCodConfirmation] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(125); // Default rate
  const [isLoadingRate, setIsLoadingRate] = useState(true);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        setIsLoadingRate(true);
        const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=KES');
        const data = await response.json();
        
        if (data.success && data.rates.KES) {
          setExchangeRate(data.rates.KES);
        } else {
          console.warn('Failed to fetch exchange rate, using default:', exchangeRate);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchExchangeRate();
  }, []);

  // Cart Data Processing
  const enrichedCartItems = cartItems
    .map((cartItem) => {
      const product = productList?.find(
        (p) => String(p._id) === String(cartItem.productId)
      );
      return product
        ? {
            ...cartItem,
            ...product,
            stock: product.totalStock ?? cartItem.stock ?? 0,
            id: cartItem.productId,
          }
        : null;
    })
    .filter(Boolean);

  // Currency Calculations
  const totalKsh = enrichedCartItems.reduce(
    (acc, item) =>
      acc + (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
    0
  );
  const totalUsd = (totalKsh / exchangeRate).toFixed(2);
  const displayTotal = paymentMethod === "paypal" 
    ? `$${totalUsd}` 
    : `Ksh. ${totalKsh.toFixed(2)}`;

  // Improved cart clearing function
  const clearCartWithFallback = async () => {
    try {
      console.log('[Checkout] Clearing cart after successful order...');
      await dispatch(clearCart()).unwrap();
      console.log('[Checkout] Cart cleared successfully');
      return { success: true };
    } catch (error) {
      console.error('[Checkout] Failed to clear cart:', error);
      
      // Show a toast notification but don't block the success flow
      toast({
        title: "Cart Warning",
        description: "Your order was successful, but we couldn't automatically clear your cart. Please refresh the page.",
        variant: "warning",
        duration: 8000
      });
      
      return { success: false, error: error.message };
    }
  };

  // Handle payment capture when returning from PayPal
  const handlePaymentCapture = async () => {
    console.log("\n====== FRONTEND: STARTING PAYMENT CAPTURE ======");
    try {
      setIsCapturingPayment(true);
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const paymentId = urlParams.get("paymentId") || token;
      const orderId = sessionStorage.getItem("currentOrderId");

      console.log("[Frontend] Capture parameters:", {
        token,
        paymentId,
        orderId,
        fullQuery: window.location.search,
      });

      if (!paymentId || !orderId) {
        const errorMsg = `Missing parameters - PaymentId: ${paymentId}, OrderId: ${orderId}`;
        console.error("[Frontend] Validation failed:", errorMsg);
        throw new Error(errorMsg);
      }

      console.log("[Frontend] Dispatching capturePayment action...");
      const result = await dispatch(
        capturePayment({ paymentId, orderId })
      ).unwrap();

      console.log("[Frontend] Capture successful:", {
        orderId: result.order.id,
        status: result.order.status,
        paypalDebugId: result.paypalDebugId,
      });

      // Clear cart after successful payment capture
      const cartClearResult = await clearCartWithFallback();

      setShowSuccessOverlay(true);
      navigate("/order-success", {
        state: {
          order: result.order,
          paymentMethod: "paypal",
          debugId: result.paypalDebugId,
          cartCleared: cartClearResult.success
        },
      });
    } catch (error) {
      console.error("[Frontend] Capture failed:", {
        message: error.message,
        payload: error.payload,
        stack: error.stack,
      });

      toast({
        title: "Payment Failed",
        description: error.message || "Could not complete payment",
        variant: "destructive",
      });

      navigate("/checkout", {
        state: {
          error: error.message,
          orderId: sessionStorage.getItem("currentOrderId"),
          paymentMethod: "paypal",
          debugInfo: error.payload?.paypalDebugId,
        },
      });
    } finally {
      setIsCapturingPayment(false);
      console.log("====== FRONTEND: CAPTURE PROCESS COMPLETED ======\n");
    }
  };

  useEffect(() => {
    console.log("[Checkout] Component mounted. Checking for PayPal return...");
    if (
      location.search.includes("token") ||
      location.search.includes("paymentId")
    ) {
      console.log(
        "[Checkout] PayPal return detected. Starting capture process."
      );
      handlePaymentCapture();
    }
  }, [location]);

  // Payment Functions
  const initiatePayment = async () => {
    try {
      setIsProcessing(true);
      const orderData = {
        userId: user.id,
        cartItems: enrichedCartItems.map((item) => ({
          productId: item.productId || item._id,
          title: item.title,
          price: item.salePrice > 0 ? item.salePrice : item.price,
          quantity: item.quantity,
          image: item.image || item.images?.[0] || "",
        })),
        totalAmount: paymentMethod === "paypal" ? Number(totalUsd) : Number(totalKsh),
        addressInfo: selectedAddress,
        paymentMethod,
      }; 

      const result = await dispatch(createOrder(orderData)).unwrap();

      if (paymentMethod === "paypal") {
        const paymentUrl = result.approvalUrl || result.paymentUrl;
        if (!paymentUrl) {
          throw new Error("No payment URL received from server");
        }
        sessionStorage.setItem("currentOrderId", result.orderId);
        window.location.href = paymentUrl;
      } else if (paymentMethod === "paystack") {
        // For Paystack - redirect to payment page
        const paymentUrl = result.paymentUrl;
        if (!paymentUrl) {
          throw new Error("No payment URL received from server");
        }
        sessionStorage.setItem("currentOrderId", result.orderId);
        window.location.href = paymentUrl;
      } else {
        // For COD - clear cart and show success
        const cartClearResult = await clearCartWithFallback();
        
        setShowSuccessOverlay(true);
        navigate("/cod-order-success", {
          state: {
            order: { 
              ...orderData, 
              _id: result.orderId,
              status: "processing",
              paymentStatus: "pending",
              createdAt: new Date().toISOString()
            },
            paymentMethod: "cod",
            date: new Date().toISOString(),
            orderTotal: orderData.totalAmount,
            cartCleared: cartClearResult.success
          },
        });
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      
      toast({
        title: "Order Failed",
        description: error.payload?.details || error.message || "Could not complete order",
        variant: "destructive",
        duration: 5000
      });

      if (paymentMethod === "paypal" || paymentMethod === "paystack") {
        sessionStorage.removeItem("currentOrderId");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (!selectedAddress) {
      toast({
        title: "📍 Address Required",
        description: "Please select a shipping address before proceeding.",
        variant: "info",
      });
      return;
    }

    if (enrichedCartItems.length === 0) {
      toast({
        title: "🛒 Cart is Empty",
        description: "Add items to your cart before checking out.",
        variant: "default",
      });
      return;
    }

    if (paymentMethod === "cod") {
      setShowCodConfirmation(true);
    } else {
      initiatePayment();
    }
  };

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Overlays
  const CodConfirmationDialog = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-2">Confirm Cash on Delivery</h3>
          <p className="text-gray-600 mb-4">
            You will pay <span className="font-bold">Ksh. {totalKsh.toFixed(2)}</span> when
            your order arrives.
          </p>
          <p className="text-sm text-red-500 mb-6">
            Important: Failed deliveries incur a{" "}
            <span className="font-bold">Ksh. 300</span> penalty fee.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCodConfirmation(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowCodConfirmation(false);
                initiatePayment();
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Confirm Order
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  const SuccessOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl text-center"
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold mb-2">
          {paymentMethod === "paypal" || paymentMethod === "paystack"
            ? "Payment Successful!"
            : "Order Confirmed!"}
        </h3>
        <p className="mb-6">
          {paymentMethod === "paypal"
            ? `Your payment of $${totalUsd} was completed.`
            : paymentMethod === "paystack"
            ? `Your payment of Ksh. ${totalKsh.toFixed(2)} was completed.`
            : `We'll contact you for delivery of your Ksh. ${totalKsh.toFixed(2)} order.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate("/account/orders")}
            className={`flex-1 ${
              paymentMethod === "paypal"
                ? "bg-blue-600 hover:bg-blue-700"
                : paymentMethod === "paystack"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            View Orders
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1"
          >
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="flex flex-col relative">
      <AnimatePresence>
        {showCodConfirmation && <CodConfirmationDialog />}
        {showSuccessOverlay && <SuccessOverlay />}
      </AnimatePresence>

      <DissolvingBanner
        imagesArray={bannerImages}
        overlayText={
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Secure Checkout
            </h1>
          </div>
        }
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))",
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 p-4">
        <Address setSelectedAddress={setSelectedAddress} />

        <div className="flex flex-col gap-4 px-4">
          {enrichedCartItems.length > 0 ? (
            enrichedCartItems.map((item) => (
              <CartContents key={item.id} cartItem={item} />
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">Total</span>
              <div className="text-right">
                {paymentMethod === "paypal" ? (
                  <>
                    <div className="font-bold text-lg">${totalUsd}</div>
                    <div className="text-sm text-gray-500">≈ Ksh. {totalKsh.toFixed(2)}</div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-lg">Ksh. {totalKsh.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">≈ ${totalUsd}</div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-3">Payment Method</h3>
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Paystack Option */}
                  <div
                    className={`border rounded-md p-2 flex items-center gap-3 cursor-pointer ${
                      paymentMethod === "paystack"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("paystack")}
                  >
                    <input
                      type="radio"
                      id="paystack"
                      name="payment"
                      checked={paymentMethod === "paystack"}
                      onChange={() => {}}
                      className="h-4 w-4 text-green-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="paystack" className="font-medium">
                        Paystack
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        M-Pesa, Airtel Money, Card
                      </p>
                    </div>
                    <div className="w-6 h-6 text-green-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* PayPal Option */}
                  <div
                    className={`border rounded-md p-2 flex items-center gap-3 cursor-pointer ${
                      paymentMethod === "paypal"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    <input
                      type="radio"
                      id="paypal"
                      name="payment"
                      checked={paymentMethod === "paypal"}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="paypal" className="font-medium">
                        PayPal
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Secure online payments
                      </p>
                    </div>
                    <div className="w-6 h-6 text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    className={`border rounded-md p-2 flex items-center gap-3 cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => setPaymentMethod("cod")}
                  > 
                    <input
                      type="radio"
                      id="cod"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => {}}
                      className="h-4 w-4 text-purple-600"
                    />
                    <div className="flex-1">
                      <label htmlFor="cod" className="font-medium">
                        Cash on Delivery
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        Pay when you receive
                      </p>
                    </div>
                    <div className="w-6 h-6 text-purple-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className={`w-full ${
                  paymentMethod === "paypal"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : paymentMethod === "paystack"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
                onClick={handlePayment}
                disabled={isProcessing || isCapturingPayment || isLoadingRate}
              >
                {isProcessing || isCapturingPayment
                  ? "Processing..."
                  : isLoadingRate
                  ? "Loading rates..."
                  : paymentMethod === "paypal"
                  ? `Pay $${totalUsd} via PayPal`
                  : paymentMethod === "paystack"
                  ? `Pay Ksh. ${totalKsh.toFixed(2)} via Paystack`
                  : `Place Order (Ksh. ${totalKsh.toFixed(2)})`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

