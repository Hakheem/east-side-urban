import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { capturePayment } from '@/store/shop/shopOrdersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaypalReturn = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const paymentId = params.get('paymentId');
  const payerId = params.get('PayerID'); 

  useEffect(() => {
    const handlePaymentCapture = async () => {
      if (paymentId && payerId) {
        const orderId = sessionStorage.getItem('currentOrderId');
        if (!orderId) {
          navigate('/payment-failure');
          return;
        }

        try {
          await dispatch(capturePayment({ paymentId, payerId, orderId })).unwrap();
          sessionStorage.removeItem('currentOrderId');
          navigate('/payment-success');
        } catch (error) {
          console.error('Payment Capture Error:', error);
          navigate('/payment-failure');
        }
      } else {
        navigate('/payment-failure');
      }
    };

    handlePaymentCapture();
  }, [paymentId, payerId, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Processing Payment...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">Please wait while we process your payment.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaypalReturn;
