import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPaystackPayment } from '@/store/shop/shopOrdersSlice';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { clearCart } from "@/store/shop/cartSlice";


const PaystackCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('processing');

  useEffect(() => {
    const handlePaystackReturn = async () => { 
      try {
        console.log("[Paystack Callback] Component mounted, processing return...");
        
        // Get parameters from URL
        const reference = searchParams.get('reference');
        const status = searchParams.get('status');
        const orderId = sessionStorage.getItem('currentOrderId');

        console.log("[Paystack Callback] Parameters:", {
          reference,
          status,
          orderId,
          fullQuery: window.location.search
        });

        // Check if payment was successful
        if (status !== 'success' || !reference) {
          console.error("[Paystack Callback] Payment failed or cancelled");
          setVerificationStatus('failed');
          
          toast({
            title: "Payment Failed",
            description: status === 'cancelled' 
              ? "Payment was cancelled" 
              : "Payment was not successful",
            variant: "destructive",
          });

          setTimeout(() => {
            navigate('/checkout', {
              state: {
                error: 'Payment was not completed successfully',
                paymentMethod: 'paystack'
              }
            });
          }, 3000);
          return;
        }

        if (!orderId) {
          console.error("[Paystack Callback] No order ID found in session");
          throw new Error('Order ID not found. Please try again.');
        }

        console.log("[Paystack Callback] Dispatching payment verification...");
        
        // Verify the payment
        const result = await dispatch(
          verifyPaystackPayment({ reference, orderId })
        ).unwrap();

        console.log("[Paystack Callback] Verification successful:", {
          orderId: result.order.id,
          status: result.order.status,
          reference: result.paymentDetails.reference
        });

        // Clear cart after successful payment
        try {
          await dispatch(clearCart());
          console.log("[Paystack Callback] Cart cleared successfully");
        } catch (clearCartError) {
          console.warn("[Paystack Callback] Failed to clear cart:", clearCartError);
        }

        setVerificationStatus('success');

        // Navigate to success page
        setTimeout(() => {
          navigate("/order-success", {
            state: {
              order: result.order,
              paymentMethod: "paystack",
              paymentDetails: result.paymentDetails,
              reference: reference
            },
          });
        }, 2000);

      } catch (error) {
        console.error("[Paystack Callback] Verification failed:", {
          message: error.message,
          payload: error.payload,
          stack: error.stack,
        });

        setVerificationStatus('failed');

        toast({
          title: "Payment Verification Failed",
          description: error.message || "Could not verify payment",
          variant: "destructive",
        });

        setTimeout(() => {
          navigate("/checkout", {
            state: {
              error: error.message,
              orderId: sessionStorage.getItem("currentOrderId"),
              paymentMethod: "paystack",
              reference: searchParams.get('reference')
            },
          });
        }, 3000);
      } finally {
        setIsVerifying(false);
        console.log("[Paystack Callback] Verification process completed");
      }
    };

    handlePaystackReturn();
  }, [searchParams, dispatch, navigate, toast]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full"
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
      >
        {isVerifying && (
          <>
            <div className="flex justify-center mb-6">
              <LoadingSpinner />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment with Paystack...
            </p>
          </>
        )}

        {!isVerifying && verificationStatus === 'success' && (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
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
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment has been verified successfully. Redirecting to order confirmation...
            </p>
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          </>
        )}

        {!isVerifying && verificationStatus === 'failed' && (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              We couldn't verify your payment. You'll be redirected to checkout to try again...
            </p>
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaystackCallback;