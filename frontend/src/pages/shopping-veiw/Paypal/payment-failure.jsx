import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleX } from 'lucide-react';

const PaymentFailure = () => {
  return (
    <div className="flex items-center justify-center h-[90vh] bg-red-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-red-600 text-white p-4">
          <CardTitle className="text-xl font-bold text-center">
            Payment Failed!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-gray-700 mb-4">
            We encountered an issue with your payment. Please try again or contact support if the issue persists.
          </p>
          <div className="flex justify-center">
          <CircleX /> 
          </div>
        </CardContent>
        <CardContent className="p-4 border-t text-center">
          <Link to="/checkout">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              Retry Payment
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;
