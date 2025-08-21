const express = require('express');
const { 
  createOrder, 
  capturePayment, 
  getAllOrdersByUser, 
  getOrderDetails,
  verifyPaystackPayment, 
  handlePaystackWebhook 
} = require('../../controllers/shop/OrderController');

const router = express.Router();

router.post('/create', createOrder); 
router.post('/capture', capturePayment);
router.get('/list/:userId', getAllOrdersByUser);
router.get('/details/:id', getOrderDetails); 

router.get('/paystack/verify/:reference', verifyPaystackPayment);
router.post('/paystack/webhook', handlePaystackWebhook);

module.exports = router;