import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { capturePayment } from '@/store/shop/shopOrdersSlice';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, BadgeCheck, Loader2 } from 'lucide-react';

const PaypalReturn = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentCapture = async () => {
      const params = new URLSearchParams(location.search);
      const paymentId = params.get('token');
      const storedOrder = sessionStorage.getItem('currentOrder');
      const orderId = storedOrder ? JSON.parse(storedOrder).orderId : null;

      if (!paymentId || !orderId) {
        navigate('/payment-failure');
        return;
      }

      try {
        await dispatch(capturePayment({ paymentId, orderId })).unwrap();
        sessionStorage.removeItem('currentOrder');
        navigate('/payment-success');
      } catch (error) {
        navigate('/payment-failure');
      }
    };

    handlePaymentCapture();
  }, [dispatch, location.search, navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-6"
    >
      {/* Animated Payment Card */}
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-sm"
      >
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut" 
            }}
          >
            <Lock className="h-10 w-10 mx-auto text-white" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-8 text-center relative">
          {/* Floating Icons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="relative h-16 w-16">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0"
              >
                <ShieldCheck className="h-6 w-6 text-blue-400 absolute top-0 left-1/2 -translate-x-1/2" />
              </motion.div>
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-800 mb-2"
          >
            Payment Verification
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-gray-600 mb-6"
          >
            Securely processing with PayPal...
          </motion.p>

          {/* Animated Progress */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-2 bg-blue-100 rounded-full overflow-hidden mb-2"
          >
            <div className="h-full bg-blue-500 rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-1 text-sm text-blue-600"
          >
            <BadgeCheck className="h-4 w-4" />
            <span>Encrypted Transaction</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.5 }}
        className="mt-8 text-sm text-gray-400 flex items-center gap-1"
      >
        🔒 Secured by PayPal
      </motion.p>
    </motion.div>
  );
};

export default PaypalReturn;