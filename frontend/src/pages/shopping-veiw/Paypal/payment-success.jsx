import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FcPaid } from "react-icons/fc";

const PaymentSuccess = () => {
  return (
    <div className="flex items-center justify-center h-[90vh] bg-green-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-green-600 text-white p-4">
          <CardTitle className="text-xl font-bold text-center">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-gray-700 mb-4">
            Thank you for your payment. Your transaction was successful, and you will receive a confirmation email shortly.
          </p>
          <div className="flex justify-center">
          <FcPaid className='w-20 h-20' />
          </div>
        </CardContent>
        <CardContent className="p-4 border-t text-center">
          <Link to="/account">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Return to Shop
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
