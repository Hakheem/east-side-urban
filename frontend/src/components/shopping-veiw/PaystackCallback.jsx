import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  
  const orderId = sessionStorage.getItem('currentOrderId');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');

      if (!reference) {
        toast({
          title: "Payment Failed",
          description: "Payment reference is missing. Please try again.",
          variant: "destructive",
        });
        setVerificationStatus('failed');
        setIsVerifying(false);
        setTimeout(() => navigate('/checkout'), 3000);
        return;
      }

      if (!orderId) {
        toast({
          title: "Order Not Found",
          description: "No order found for this payment. Try again.",
          variant: "destructive",
        });
        setVerificationStatus('failed');
        setIsVerifying(false);
        setTimeout(() => navigate('/checkout'), 3000);
        return;
      }

      try {
        // Dispatch verification thunk
        const result = await dispatch(
          verifyPaystackPayment({ reference, orderId })
        ).unwrap();

        setVerificationStatus('success');

        // Clear cart after successful payment
        try {
          await dispatch(clearCart());
        } catch (e) {
          console.warn("Failed to clear cart:", e);
        }

        // Navigate to order success page
        setTimeout(() => {
          navigate('/paystack-order-success', {
            state: {
              order: result.order,
              paymentDetails: result.paymentDetails,
              paymentMethod: 'paystack',
              reference
            }
          });
        }, 2000);

      } catch (error) {
        toast({
          title: "Payment Verification Failed",
          description: error.message || "Could not verify payment",
          variant: "destructive",
        });
        setVerificationStatus('failed');
        setTimeout(() => navigate('/checkout'), 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, dispatch, navigate, toast, orderId]);

  // Loading spinner
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
              Your payment has been verified. Redirecting to order confirmation...
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
              We couldn't verify your payment. You will be redirected to checkout to try again.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaystackCallback;

