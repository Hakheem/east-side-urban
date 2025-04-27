import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FcPaid } from "react-icons/fc";
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center h-[95vh] bg-gradient-to-br from-green-50 to-emerald-50 p-4"
    >
      <motion.div
        initial={{ y: -20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Card className="w-full max-w-md shadow-xl overflow-hidden border-0">
          {/* Animated Header */}
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-20" />
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </motion.div>
              Payment Successful!
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
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              >
                <FcPaid className="w-24 h-24 mb-6" />
              </motion.div>
              
              <p className="text-gray-700 mb-6 text-lg">
                Thank you for your payment! Your order is confirmed.
              </p>
              
              <div className="w-full bg-green-100 rounded-lg p-4 mb-6 border border-green-200">
                <p className="text-green-800 font-medium">
                  You'll receive a confirmation email shortly.
                </p>
              </div>
            </motion.div>
          </CardContent>

          {/* Footer */}
          <CardContent className="px-6 pb-6 pt-0 border-t border-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/account">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        {/* Floating Confetti */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0,
              y: -20,
              x: Math.random() * 100 - 50
            }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [0, -100],
              x: Math.random() * 40 - 20
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
            className="absolute text-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: '30%'
            }}
          >
            {['🎉', '💰', '🛒', '💳', '✨'][Math.floor(Math.random() * 5)]}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default PaymentSuccess;