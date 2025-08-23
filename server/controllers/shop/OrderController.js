const { paypal, client: paypalClient } = require("../../helpers/paypal");
const Orders = require("../../models/Orders");
const Product = require("../../models/Products");
const Cart = require("../../models/Cart");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const isProd = process.env.PAYPAL_MODE === "live"; 

const clientBaseUrl = isProd
  ? process.env.CLIENT_URL_PROD
  : process.env.CLIENT_URL_DEV;

const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, totalAmount, addressInfo, paymentMethod } =
      req.body;

    // Validate required fields
    if (!userId || !cartItems || !totalAmount || !addressInfo) {
      console.error("[Order Creation] Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check product availability and stock before creating order
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.title} not found`,
        });
      }
      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.title}. Available: ${product.totalStock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Create new order with dates
    const newOrder = new Orders({
      userId,
      cartItems,
      totalAmount,
      addressInfo,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      orderDate: new Date(),
      orderUpdateDate: new Date(),
    });

    await newOrder.save();

    // Handle Cash on Delivery - process immediately and reduce stock
    if (paymentMethod === "cod") {
      try {
        console.log(
          "[COD Order] Processing COD order immediately:",
          newOrder._id
        );

        // ✅ REDUCE STOCK IMMEDIATELY FOR COD ORDERS
        for (const item of cartItems) {
          const product = await Product.findById(item.productId);
          if (product) {
            const previousStock = product.totalStock;
            product.totalStock = Math.max(
              0,
              product.totalStock - item.quantity
            );
            await product.save();

            console.log(
              `[COD Order] Updated stock for product ${product._id}:`,
              {
                title: product.title,
                previousStock: previousStock,
                newStock: product.totalStock,
                soldQuantity: item.quantity,
              }
            );
          } else {
            console.warn(
              `[COD Order] Product not found during stock update: ${item.productId}`
            );
          }
        }

        // ✅ CLEAR USER'S CART IMMEDIATELY FOR COD
        const cartDeleteResult = await Cart.findOneAndDelete({ userId });
        console.log(
          "[COD Order] Cart cleared for user:",
          userId,
          cartDeleteResult ? "Success" : "Cart not found"
        );

        // ✅ UPDATE ORDER STATUS TO CONFIRMED FOR COD
        newOrder.orderStatus = "confirmed";
        newOrder.paymentStatus = "pending"; // Will be paid on delivery
        newOrder.orderUpdateDate = new Date();
        await newOrder.save();

        console.log("[COD Order] COD order processed successfully:", {
          orderId: newOrder._id,
          totalAmount: newOrder.totalAmount,
          itemsCount: cartItems.length,
        });

        return res.status(201).json({
          success: true,
          orderId: newOrder._id,
          orderDate: newOrder.orderDate,
          message: "COD order created and processed successfully",
          orderStatus: "confirmed",
          paymentStatus: "pending",
        });
      } catch (codError) {
        console.error("[COD Order] Error processing COD order:", codError);

        // If there's an error processing COD, we should clean up the order
        // or at least return an error to the user
        return res.status(500).json({
          success: false,
          message: "Failed to process COD order: " + codError.message,
        });
      }
    }

    // Handle PayPal payments
    if (paymentMethod === "paypal") {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: totalAmount.toFixed(2),
            },
            description: "Order payment",
          },
        ],
        application_context: {
          return_url: `${clientBaseUrl}/checkout`, // Fixed: should return to checkout to handle capture
          cancel_url: `${clientBaseUrl}/checkout`,
          brand_name: "East Side Street Wear",
        },
      });

      const paypalOrder = await paypalClient.execute(request);
      console.log("PayPal Order Created:", {
        id: paypalOrder.result.id,
        status: paypalOrder.result.status,
      });

      const approvalLink = paypalOrder.result.links.find(
        (link) => link.rel === "approve"
      );
      if (!approvalLink) {
        throw new Error("No approval URL found in PayPal response");
      }

      return res.status(201).json({
        success: true,
        approvalUrl: approvalLink.href,
        paymentUrl: approvalLink.href,
        orderId: newOrder._id,
        orderDate: newOrder.orderDate,
      });
    }

    // Handle Paystack payments
    if (paymentMethod === "paystack") {
      try {
        // Get user email from addressInfo or generate a default one
        const userEmail = addressInfo.email || `user${userId}@eastside.com`;

        const paystackData = {
          email: userEmail,
          amount: Math.round(totalAmount * 100), // Paystack expects amount in kobo
          currency: "KES",
          reference: `order_${newOrder._id}_${Date.now()}`,
          callback_url: `${clientBaseUrl}/paystack-callback`,
          metadata: {
            orderId: newOrder._id.toString(),
            userId: userId,
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: newOrder._id.toString(),
              },
            ],
          },
        };

        console.log("Initializing Paystack payment:", {
          orderId: newOrder._id,
          amount: paystackData.amount,
          email: userEmail,
        });

        const paystackResponse = await axios.post(
          "https://api.paystack.co/transaction/initialize",
          paystackData,
          {
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!paystackResponse.data.status) {
          throw new Error(
            paystackResponse.data.message || "Paystack initialization failed"
          );
        }

        // Store the payment reference in the order
        newOrder.paymentReference = paystackData.reference;
        await newOrder.save();

        console.log("Paystack payment initialized:", {
          reference: paystackData.reference,
          authorizationUrl: paystackResponse.data.data.authorization_url,
        });

        return res.status(201).json({
          success: true,
          paymentUrl: paystackResponse.data.data.authorization_url,
          reference: paystackData.reference,
          orderId: newOrder._id,
          orderDate: newOrder.orderDate,
        });
      } catch (paystackError) {
        console.error("Paystack initialization error:", {
          message: paystackError.message,
          response: paystackError.response?.data,
          status: paystackError.response?.status,
        });

        return res.status(500).json({
          success: false,
          message:
            paystackError.response?.data?.message ||
            paystackError.message ||
            "Paystack payment initialization failed",
        });
      }
    }

    // Fallback for unknown payment methods
    return res.status(400).json({
      success: false,
      message: `Unsupported payment method: ${paymentMethod}`,
    });
  } catch (error) {
    console.error("Order Creation Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

// Enhanced Paystack payment verification
const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    console.log("Verifying Paystack payment:", reference);

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response.data;

    if (data.status === "success") {
      // Find the order using the reference or metadata
      const orderId = data.metadata?.orderId || data.metadata?.order_id;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID not found in payment metadata",
        });
      }

      const order = await Orders.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if payment has already been processed (prevent double processing)
      if (order.paymentStatus === "paid") {
        console.log("Payment already processed for order:", orderId);
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
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
            },
          },
        });
      }

      // Process payment and update inventory
      try {
        // Subtract purchased quantities from product stock
        for (const item of order.cartItems) {
          const product = await Product.findById(item.productId);
          if (product) {
            // Double-check stock availability
            if (product.totalStock < item.quantity) {
              console.error(
                `Insufficient stock for product ${item.productId}:`,
                {
                  available: product.totalStock,
                  requested: item.quantity,
                }
              );
              // You might want to handle this case differently
              // For now, we'll set stock to 0 if it goes negative
            }
            product.totalStock = Math.max(
              0,
              product.totalStock - item.quantity
            );
            await product.save();

            console.log(`Updated stock for product ${product._id}:`, {
              title: product.title,
              previousStock: product.totalStock + item.quantity,
              newStock: product.totalStock,
              soldQuantity: item.quantity,
            });
          } else {
            console.warn(
              `Product not found during stock update: ${item.productId}`
            );
          }
        }

        // Clear user's cart
        const cartDeleteResult = await Cart.findOneAndDelete({
          userId: order.userId,
        });
        console.log(
          "Cart cleared for user:",
          order.userId,
          cartDeleteResult ? "Success" : "Cart not found"
        );

        // Update order
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paymentReference = reference;
        order.isPaid = true;
        order.paidAt = new Date(data.paid_at);
        order.orderUpdateDate = new Date();
        await order.save();

        console.log("Paystack payment verified and order updated:", {
          orderId: order._id,
          reference: reference,
          amount: data.amount / 100,
          paidAt: data.paid_at,
        });
      } catch (processingError) {
        console.error(
          "Error processing payment verification:",
          processingError
        );
        return res.status(500).json({
          success: false,
          message: "Payment verified but order processing failed",
          error: processingError.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: {
          reference: data.reference,
          amount: data.amount / 100,
          currency: data.currency,
          status: data.status,
          paid_at: data.paid_at,
          order: {
            id: order._id,
            status: order.paymentStatus,
            orderStatus: order.orderStatus,
            orderDate: order.orderDate,
            updateTime: order.orderUpdateDate,
          },
        },
      });
    } else {
      console.log("Payment verification failed:", {
        reference,
        status: data.status,
        message: data.gateway_response,
      });

      return res.status(400).json({
        success: false,
        message: data.gateway_response || "Payment verification failed",
        data: data,
      });
    }
  } catch (error) {
    console.error("Paystack verification error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({
      success: false,
      message: error.response?.data?.message || "Payment verification failed",
      error: error.message,
    });
  }
};

// Enhanced Paystack webhook handler
const handlePaystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // Verify webhook signature
    if (hash !== req.headers["x-paystack-signature"]) {
      console.error("Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    console.log("Paystack webhook received:", {
      event: event.event,
      reference: event.data?.reference,
    });

    switch (event.event) {
      case "charge.success":
        const { reference, metadata, amount, currency, paid_at } = event.data;
        const orderId = metadata?.orderId || metadata?.order_id;

        if (orderId) {
          const order = await Orders.findById(orderId);
          if (order && order.paymentStatus === "pending") {
            // Process the same way as verification
            try {
              // Update inventory
              for (const item of order.cartItems) {
                const product = await Product.findById(item.productId);
                if (product) {
                  product.totalStock = Math.max(
                    0,
                    product.totalStock - item.quantity
                  );
                  await product.save();
                }
              }

              // Clear cart
              await Cart.findOneAndDelete({ userId: order.userId });

              // Update order
              order.paymentStatus = "paid";
              order.orderStatus = "confirmed";
              order.paymentReference = reference;
              order.isPaid = true;
              order.paidAt = new Date(paid_at);
              order.orderUpdateDate = new Date();
              await order.save();

              console.log("Order updated via webhook:", {
                orderId,
                reference,
                amount: amount / 100,
              });
            } catch (processingError) {
              console.error("Error processing webhook:", processingError);
            }
          } else {
            console.log("Order not found or already processed:", orderId);
          }
        }
        break;

      case "charge.failed":
        console.log("Payment failed via webhook:", {
          reference: event.data?.reference,
          reason: event.data?.gateway_response,
        });
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing failed");
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

    // Check if payment is already captured
    if (order.paymentStatus === "paid") {
      console.log("Payment already captured for order:", orderId);
      return res.status(200).json({
        success: true,
        message: "Payment already captured",
        order: {
          id: order._id,
          status: order.paymentStatus,
          amount: order.totalAmount,
          orderDate: order.orderDate,
          updateTime: order.orderUpdateDate,
        },
      });
    }

    const request = new paypal.orders.OrdersCaptureRequest(paymentId);
    request.requestBody({});
    request.headers["PayPal-Request-Id"] = orderId;

    const capture = await paypalClient.execute(request);

    if (capture.result.status !== "COMPLETED") {
      throw new Error(
        `Payment not completed. Status: ${capture.result.status}`
      );
    }

    // Process payment - subtract quantities from product stock
    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalStock = Math.max(0, product.totalStock - item.quantity);
        await product.save();

        console.log(`Updated stock for product ${product._id}:`, {
          title: product.title,
          newStock: product.totalStock,
          soldQuantity: item.quantity,
        });
      }
    }

    // Clear user's cart
    await Cart.findOneAndDelete({ userId: order.userId });

    // Update order status and timestamps
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentId = capture.result.id;
    order.payerId = capture.result.payer?.payer_id || order.payerId;
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderDate = order.orderDate || new Date();
    order.orderUpdateDate = new Date();
    await order.save();

    console.log("PayPal payment captured successfully:", {
      orderId: order._id,
      paymentId: capture.result.id,
      amount: order.totalAmount,
    });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      order: {
        id: order._id,
        status: order.paymentStatus,
        orderStatus: order.orderStatus,
        amount: order.totalAmount,
        orderDate: order.orderDate,
        updateTime: order.orderUpdateDate,
      },
      captureDetails: {
        id: capture.result.id,
        status: capture.result.status,
        payer: capture.result.payer,
      },
      paypalDebugId: capture.headers?.["paypal-debug-id"],
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to capture payment",
      paypalDebugId: error.headers?.["paypal-debug-id"],
      correlationId: error.headers?.["paypal-correlation-id"],
    });
  }
};

// Process COD Payment (for when delivery is completed and payment is received)
const processCodPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const order = await Orders.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentMethod !== "cod") {
      return res.status(400).json({
        success: false,
        message: "This is not a cash on delivery order",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    //  update payment status and order status
    order.paymentStatus = "paid";
    order.orderStatus = "Processing";
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderUpdateDate = new Date();
    await order.save();

    console.log("[COD Payment] COD payment marked as completed:", {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paidAt: order.paidAt,
    });

    res.status(200).json({
      success: true,
      message: "COD payment processed successfully",
      order: {
        id: order._id,
        status: order.paymentStatus,
        orderStatus: order.orderStatus,
        paidAt: order.paidAt,
        totalAmount: order.totalAmount,
      },
    });
  } catch (error) {
    console.error("COD processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process COD payment",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Orders.find({ userId }).sort({ orderDate: -1 }); // Sort by newest first

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
    console.error("Get Orders Error:", error);
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
    console.error("Get Order Details Error:", error);
    res.status(500).json({
      success: false,
      message: "Error while fetching order details.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  verifyPaystackPayment,
  handlePaystackWebhook,
  processCodPayment,
  getAllOrdersByUser,
  getOrderDetails,
};
