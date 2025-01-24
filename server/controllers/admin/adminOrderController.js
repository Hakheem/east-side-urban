const Order = require('../../models/Orders'); 

const getAllOrdersofUsers = async (req, res) => {
  try {
    const orders = await Order.find({});
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: 'No orders found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Orders fetched successfully.',
      data: orders,
    });
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error while fetching orders.',
      error: error.message,
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id); 

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Order fetched successfully.',
      data: order,
    });
  } catch (error) {
    console.error('Fetch Order Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error while fetching order details.',
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error while updating order status.',
      error: error.message,
    });
  }
};

module.exports = { getAllOrdersofUsers, getOrderDetailsForAdmin, updateOrderStatus };
