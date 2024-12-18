const paypal = require('../../helpers/paypal');
const Orders = require('../../models/Orders');


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
    } = req.body;

    if (!userId || !cartItems || !totalAmount) {
      return res.status(400).json({ success: false, message: 'Invalid input data.' });
    }

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

    paypal.payment.create(payment_json, async (error, paymentCheck) => {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: 'Error while creating payment.',
        });
      }

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
      });

      await newlyCreatedOrder.save();

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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error while creating order.',
    });
  }
};


const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId } = req.body;

    if (!paymentId || !payerId) {
      return res.status(400).json({ success: false, message: 'Missing payment ID or payer ID.' });
    }

    paypal.payment.execute(
      paymentId,
      { payer_id: payerId },
      async (error, payment) => {
        if (error) {
          console.error(error?.response || error);
          return res.status(500).json({
            success: false,
            message: 'Error while capturing payment.',
          });
        }

        if (payment.state === 'approved') {
          const order = new Orders({
            userId: payment.payer.payer_info.payer_id,
            cartItems: payment.transactions[0].item_list.items,
            orderStatus: 'Completed',
            addressInfo: payment.payer.payer_info.shipping_address,
            paymentMethod: payment.payer.payment_method,
            paymentStatus: payment.state,
            totalAmount: payment.transactions[0].amount.total,
            orderDate: new Date(),
            orderUpdateDate: new Date(),
          });

          await order.save();

          res.status(200).json({
            success: true,
            message: 'Payment captured and order created successfully.',
            order,
          });
        } else {
          res.status(400).json({
            success: false,
            message: 'Payment not approved.',
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error occurred while capturing payment.',
    });
  }
};

module.exports = { createOrder, capturePayment };
