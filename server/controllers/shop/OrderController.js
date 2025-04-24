const { paypal, client: paypalClient } = require("../../helpers/paypal");
const Orders = require("../../models/Orders");
const Product = require("../../models/Products");
const Cart = require("../../models/Cart");
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

    // Create PayPal order only for PayPal payments
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
        orderId: newOrder._id,
        orderDate: newOrder.orderDate
      });
    }

    // For non-PayPal payments (like COD)
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
  getAllOrdersByUser,
  getOrderDetails,
};