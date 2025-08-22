const express = require('express');
const { 
  createOrder, 
  capturePayment, 
  getAllOrdersByUser, 
  getOrderDetails,
  verifyPaystackPayment, 
  handlePaystackWebhook,
  processCodPayment
} = require('../../controllers/shop/OrderController');

const router = express.Router();

// Order management routes
router.post('/create', createOrder); 
router.post('/capture', capturePayment);
router.get('/list/:userId', getAllOrdersByUser);
router.get('/details/:id', getOrderDetails); 

// Paystack routes
router.get('/paystack/verify/:reference', verifyPaystackPayment);
router.post('/paystack/webhook', handlePaystackWebhook);

// ⭐ NEW: Paystack callback redirect route
router.get('/paystack/callback', (req, res) => {
  const queryString = new URLSearchParams(req.query).toString();
  const frontendUrl = process.env.CLIENT_URL_DEV || process.env.CLIENT_URL_PROD || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/paystack-callback?${queryString}`);
});

// COD processing route
router.post('/cod/process', processCodPayment);

module.exports = router; 