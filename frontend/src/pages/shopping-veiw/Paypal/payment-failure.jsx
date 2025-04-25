import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleX, RotateCw, AlertTriangle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentFailure = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-50 p-4"
    >
      <motion.div
        initial={{ y: -20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Animated Header */}
          <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-20" />
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <AlertTriangle className="h-8 w-8" />
              </motion.div>
              Payment Failed
            </CardTitle>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="mb-6 text-red-500"
              >
                <CircleX className="w-20 h-20" strokeWidth={1.5} />
              </motion.div>
              
              <p className="text-gray-700 mb-6 text-lg">
                We couldn't process your payment. Please try again.
              </p>
              
              <div className="w-full bg-red-50 rounded-lg p-4 mb-6 border border-red-100">
                <div className="flex items-start gap-3 text-red-800">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p className="text-left">
                    <span className="font-medium">Possible reasons:</span> Insufficient funds, card declined, or temporary service issue.
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>

          {/* Footer */}
          <CardContent className="px-6 pb-6 pt-0 border-t border-gray-100 space-y-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/checkout">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all mb-3"
                >
                  <RotateCw className="mr-2 h-5 w-5" />
                  Try Payment Again
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                asChild
              >
                <Link to="/contact">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Support
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>

        {/* Warning pulse effect */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-red-400 -z-10 mx-auto w-64 h-64"
          style={{
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default PaymentFailure;