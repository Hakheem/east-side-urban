const { paypal, client: paypalClient } = require("../../helpers/paypal");
const Orders = require("../../models/Orders");
const Product = require("../../models/Products");
const Cart = require("../../models/Cart");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const isProd = process.env.ENV_MODE === "prod";
const clientBaseUrl = isProd
  ? process.env.CLIENT_URL_PROD
  : process.env.CLIENT_URL_DEV;

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, totalAmount, addressInfo, paymentMethod } = req.body;

    // Validate required fields
    if (!userId || !cartItems || !totalAmount || !addressInfo) {
      console.error('[Order Creation] Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new order with dates
    const newOrder = new Orders({
      userId,
      cartItems,
      totalAmount,
      addressInfo,
      paymentMethod,
      paymentStatus: 'pending',
      orderDate: new Date(),
      orderUpdateDate: new Date()
    });

    await newOrder.save();

    // Handle PayPal payments
    if (paymentMethod === 'paypal') {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: totalAmount.toFixed(2),
          },
          description: "Order payment",
        }],
        application_context: {
          return_url: `${clientBaseUrl}/paypal-return`,
          cancel_url: `${clientBaseUrl}/checkout`,
          brand_name: "East Side Street Wear",
        },
      });

      const paypalOrder = await paypalClient.execute(request);
      console.log('PayPal Order Created:', {
        id: paypalOrder.result.id,
        status: paypalOrder.result.status
      });

      const approvalLink = paypalOrder.result.links.find(link => link.rel === 'approve');
      if (!approvalLink) {
        throw new Error('No approval URL found in PayPal response');
      }

      return res.status(201).json({
        success: true,
        approvalUrl: approvalLink.href,
        paymentUrl: approvalLink.href, // For consistency
        orderId: newOrder._id,
        orderDate: newOrder.orderDate
      });
    }

    // Handle Paystack payments
    if (paymentMethod === 'paystack') {
      try {
        // Get user email from the order (assuming it's in addressInfo or you need to fetch it)
        const userEmail = addressInfo.email || `user${userId}@example.com`; // You might need to adjust this

        const paystackData = {
          email: userEmail,
          amount: Math.round(totalAmount * 100), // Paystack expects amount in kobo (cents)
          currency: 'KES', // or 'NGN' depending on your preference
          reference: `order_${newOrder._id}_${Date.now()}`,
          callback_url: `${clientBaseUrl}/paystack-callback`,
          metadata: {
            orderId: newOrder._id.toString(),
            userId: userId,
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: newOrder._id.toString()
              }
            ]
          }
        };

        console.log('Initializing Paystack payment:', {
          orderId: newOrder._id,
          amount: paystackData.amount,
          email: userEmail
        });

        const paystackResponse = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          paystackData,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!paystackResponse.data.status) {
          throw new Error(paystackResponse.data.message || 'Paystack initialization failed');
        }

        // Store the payment reference in the order
        newOrder.paymentReference = paystackData.reference;
        await newOrder.save();

        console.log('Paystack payment initialized:', {
          reference: paystackData.reference,
          authorizationUrl: paystackResponse.data.data.authorization_url
        });

        return res.status(201).json({
          success: true,
          paymentUrl: paystackResponse.data.data.authorization_url,
          reference: paystackData.reference,
          orderId: newOrder._id,
          orderDate: newOrder.orderDate
        });

      } catch (paystackError) {
        console.error('Paystack initialization error:', {
          message: paystackError.message,
          response: paystackError.response?.data,
          status: paystackError.response?.status
        });
        
        return res.status(500).json({
          success: false,
          message: paystackError.response?.data?.message || paystackError.message || 'Paystack payment initialization failed'
        });
      }
    }

    // For non-online payments (like COD)
    return res.status(201).json({
      success: true,
      orderId: newOrder._id,
      orderDate: newOrder.orderDate
    });

  } catch (error) {
    console.error('Order Creation Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order'
    });
  }
};

// New function to verify Paystack payment
const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    console.log('Verifying Paystack payment:', reference);

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response.data;

    if (data.status === 'success') {
      // Find the order using the reference or metadata
      const orderId = data.metadata?.orderId || data.metadata?.order_id;
      const order = await Orders.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order status if payment is successful
      if (order.paymentStatus !== 'paid') {
        // Subtract purchased quantities from product stock
        for (const item of order.cartItems) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.totalStock = Math.max(0, product.totalStock - item.quantity);
            await product.save();
          }
        }

        // Clear user's cart
        await Cart.findOneAndDelete({ userId: order.userId });

        // Update order
        order.paymentStatus = 'paid';
        order.paymentReference = reference;
        order.orderUpdateDate = new Date();
        await order.save();

        console.log('Paystack payment verified and order updated:', {
          orderId: order._id,
          reference: reference,
          amount: data.amount / 100
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: data.reference,
          amount: data.amount / 100,
          currency: data.currency,
          status: data.status,
          paid_at: data.paid_at,
          order: {
            id: order._id,
            status: order.paymentStatus,
            orderDate: order.orderDate,
            updateTime: order.orderUpdateDate,
          }
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: data
      });
    }

  } catch (error) {
    console.error('Paystack verification error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Payment verification failed',
      error: error.message
    });
  }
};

// Paystack webhook handler
const handlePaystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;
      
      console.log('Paystack webhook received:', event.event);

      switch (event.event) {
        case 'charge.success':
          const { reference, metadata } = event.data;
          const orderId = metadata?.orderId || metadata?.order_id;
          
          if (orderId) {
            const order = await Orders.findById(orderId);
            if (order && order.paymentStatus === 'pending') {
              // Update order status
              order.paymentStatus = 'paid';
              order.paymentReference = reference;
              order.orderUpdateDate = new Date();
              await order.save();

              console.log('Order updated via webhook:', orderId);
            }
          }
          break;
          
        case 'charge.failed':
          console.log('Payment failed via webhook:', event.data);
          break;
          
        default:
          console.log('Unhandled webhook event:', event.event);
      }
      
      res.status(200).send('OK');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;

    if (!paymentId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing paymentId or orderId",
      });
    }

    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const request = new paypal.orders.OrdersCaptureRequest(paymentId);
    request.requestBody({});
    request.headers["PayPal-Request-Id"] = orderId;

    const capture = await paypalClient.execute(request);

    if (capture.result.status !== "COMPLETED") {
      throw new Error(`Payment not completed. Status: ${capture.result.status}`);
    }

    // ✅ Subtract purchased quantities from product stock
    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalStock = Math.max(0, product.totalStock - item.quantity);
        await product.save();
      }
    }

    // ✅ Clear user's cart
    await Cart.findOneAndDelete({ userId: order.userId });

    // ✅ Update order status and timestamps
    order.paymentStatus = "paid";
    order.paymentId = capture.result.id;
    order.payerId = capture.result.payer?.payer_id || order.payerId;
    order.orderDate = order.orderDate || new Date();
    order.orderUpdateDate = new Date();
    await order.save();

    // ✅ Respond
    res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      order: {
        id: order._id,
        status: order.paymentStatus,
        amount: order.totalAmount,
        orderDate: order.orderDate,
        updateTime: order.orderUpdateDate,
      },
      paypalDebugId: capture.headers["paypal-debug-id"],
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to capture payment",
      paypalDebugId: error.headers?.["paypal-debug-id"],
      correlationId: error.headers?.["paypal-correlation-id"],
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Orders.find({ userId });
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully.",
      data: orders,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching orders.",
      error: error.message,
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Orders.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Order fetched successfully.",
      data: order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching orders.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  verifyPaystackPayment,
  handlePaystackWebhook,
  getAllOrdersByUser,
  getOrderDetails,
};
