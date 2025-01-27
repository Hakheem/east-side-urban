const express = require('express');
const { getAllOrdersofUsers, getOrderDetailsForAdmin, updateOrderStatus } = require('../../controllers/admin/adminOrderController');

const router = express.Router(); 


router.get('/admin-orders', getAllOrdersofUsers );
router.get('/admin-order-details/:id', getOrderDetailsForAdmin );
router.put('/update-order-status/:id', updateOrderStatus );

module.exports = router;  
 