// routes/payment.js
const express = require('express');
const router = express.Router();
const paystack = require('../config/paystack');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// Initialize Paystack payment
router.post('/paystack/create', protect, async (req, res) => {
  try {
    const { email, amount, metadata, currency = 'KES' } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // For KES, Paystack expects amount in the smallest unit (cents)
    const paystackAmount = Math.round(amount * 100);
    
    const response = await paystack.transaction.initialize({
      email,
      amount: paystackAmount,
      currency,
      channels: ['card', 'bank', 'mobile_money'],
      metadata,
      callback_url: `${process.env.CLIENT_URL_DEV}/order-success`,
    });

    // Update order with Paystack reference if orderId is provided
    if (metadata && metadata.orderId) {
      await Order.findByIdAndUpdate(metadata.orderId, {
        paystackReference: response.data.reference,
        paystackAuthorizationUrl: response.data.authorization_url,
        paymentStatus: 'processing',
        orderUpdateDate: Date.now()
      });
    }

    res.json({
      success: true,
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      reference: response.data.reference
    });
  } catch (error) {
    console.error('Paystack initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment'
    });
  }
});

// Verify Paystack payment
router.get('/paystack/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    
    const response = await paystack.transaction.verify(reference);
    
    if (response.data.status === 'success') {
      // Find order by reference and update status
      const order = await Order.findOne({ paystackReference: reference });
      
      if (order) {
        order.paymentStatus = 'completed';
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'processing'; // Update order status
        order.orderUpdateDate = Date.now();
        await order.save();
        
        res.json({
          success: true,
          data: response.data,
          order: order
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else {
      res.json({
        success: false,
        message: 'Payment not successful',
        data: response.data
      });
    }
  } catch (error) {
    console.error('Paystack verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
});

// Webhook for Paystack events
router.post('/paystack/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const crypto = require('crypto');
    
    // Verify webhook signature
    const hash = crypto.createHmac('sha512', secret)
      .update(req.body)
      .digest('hex');
    
    if (hash === req.headers['x-paystack-signature']) {
      const event = JSON.parse(req.body.toString());
      
      if (event.event === 'charge.success') {
        const { reference } = event.data;
        
        // Verify and update order status
        const response = await paystack.transaction.verify(reference);
        
        if (response.data.status === 'success') {
          const order = await Order.findOne({ paystackReference: reference });
          
          if (order) {
            order.paymentStatus = 'completed';
            order.isPaid = true;
            order.paidAt = Date.now();
            order.orderStatus = 'processing';
            order.orderUpdateDate = Date.now();
            await order.save();
            
            console.log('Payment verified via webhook for order:', order._id);
          }
        }
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;