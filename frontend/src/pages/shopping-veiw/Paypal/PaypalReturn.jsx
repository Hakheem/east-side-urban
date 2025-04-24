import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { capturePayment } from '@/store/shop/shopOrdersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaypalReturn = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaymentCapture = async () => {
      const params = new URLSearchParams(location.search);
      const paymentId = params.get('token'); // PayPal sends "token" not "paymentId"

      const storedOrder = sessionStorage.getItem('currentOrder');
      const parsedOrder = storedOrder ? JSON.parse(storedOrder) : null;
      const orderId = parsedOrder?.orderId;

      if (!paymentId || !orderId) {
        console.error('Missing paymentId or orderId');
        navigate('/payment-failure');
        return;
      }

      try {
        await dispatch(capturePayment({ paymentId, orderId })).unwrap();
        sessionStorage.removeItem('currentOrder');
        navigate('/payment-success');
      } catch (error) {
        console.error('Payment Capture Error:', error);
        navigate('/payment-failure');
      }
    };

    handlePaymentCapture();
  }, [dispatch, location.search, navigate]);

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
