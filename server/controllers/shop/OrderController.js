const paypal = require('../../helpers/paypal');
const Orders = require('../../models/Orders');
const Cart = require('../../models/Cart');
const { Types } = require('mongoose');

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      orderStatus,
      addressInfo,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Validate required fields
    if (!userId || !cartItems || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Invalid input data. Please ensure userId, cartItems, and totalAmount are provided.' });
    }

    // Set up PayPal payment JSON
    const payment_json = {
      intent: 'sale',
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: 'http://localhost:5173/paypal-return',
        cancel_url: 'http://localhost:5173/paypal-cancel',
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: 'USD',
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: 'USD',
            total: totalAmount.toFixed(2),
          },
          description: 'Order payment',
        },
      ],
    };

    // Create PayPal payment
    paypal.payment.create(payment_json, async (error, paymentCheck) => {
      if (error) {
        console.error('PayPal Error:', error);
        return res.status(500).json({
          success: false,
          message: 'Error while creating PayPal payment.',
          error: error.response || error,
        });
      }

      // Create the new order
      const newlyCreatedOrder = new Orders({
        userId,
        cartItems,
        orderStatus,
        addressInfo,
        paymentMethod,
        paymentStatus,
        totalAmount,
        orderDate,
        orderUpdateDate,
        paymentId,
        payerId,
        cartId,
      });

      await newlyCreatedOrder.save();

      // Find approval URL
      const approvalUrl = paymentCheck.links?.find(
        (link) => link.rel === 'approval_url'
      )?.href;

      if (approvalUrl) {
        return res.status(201).json({
          success: true,
          message: 'Payment created successfully.',
          approvalUrl,
          orderId: newlyCreatedOrder._id,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Approval URL not found in payment response.',
        });
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error while creating order.',
      error: error.message,
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    if (!paymentId || !payerId || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: paymentId, payerId, or orderId.',
      });
    }

    // Clean the orderId (remove extra quotes)
    const cleanedOrderId = orderId.replace(/['"]+/g, '');

    if (cleanedOrderId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid orderId format.',
      });
    }

    const order = await Orders.findById(cleanedOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Execute the PayPal payment capture
    paypal.payment.execute(paymentId, { payer_id: payerId }, async (error, payment) => {
      if (error) {
        console.error('PayPal Error:', error.response || error);
        return res.status(500).json({
          success: false,
          message: 'Error capturing PayPal payment.',
          error: error.response || error,
        });
      }

      if (payment.state === 'approved') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paymentId = paymentId;
        order.payerId = payerId;

        const cart = await Cart.findOne({ userId: order.userId });
        if (cart) {
          cart.items = [];  
          await cart.save();
        }

        await order.save();

        return res.status(200).json({
          success: true,
          message: 'Payment captured successfully and cart reset.',
          order,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Payment not approved.',
        });
      }
    });
  } catch (error) {
    console.error('Capture Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while capturing payment.',
      error: error.message,
    });
  }
};

const getAllOrdersByUser = async(req, res) =>{
  try {
    const { userId } = req.params;
    const orders = await Orders.find({userId})
    if(!orders.length){
      return res.status(404).json({
        success: false,
        message: 'No orders found for this user.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully.',
      data: orders,
    })

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error while fetching orders.',
      error: error.message,
    });
  }
}


const getOrderDetails = async(req, res) =>{
  try {
    const {id} = req.params
    const order = await Orders.findById(id);

    if(!order){
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Order fetched successfully.',
      data: order,
    })


  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error while fetching orders.',
      error: error.message,
    });
  }
}



module.exports = { createOrder, capturePayment, getAllOrdersByUser, getOrderDetails };
