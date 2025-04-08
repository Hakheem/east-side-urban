import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getAllOrdersForAdmin, getOrderDetailsForAdmin, updateOrderStatusForAdmin } from "@/store/admin/adminOrderSlice";

const initialFormData = {
  orderStatus: ""
};

const AdminOrderDetails = ({ orderDetails }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialFormData);

  // Ensure formData updates when orderDetails change
  useEffect(() => {
    if (orderDetails) {
      setFormData({ orderStatus: orderDetails.orderStatus || "" });
    }
  }, [orderDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateStatus = (event) => {
    event.preventDefault();

    // Use formData.orderStatus instead of undefined orderStatus
    dispatch(updateOrderStatusForAdmin({ id: orderDetails?._id, orderStatus: formData.orderStatus }))
      .then((data) => {
        if (data?.payload?.success) {
          console.log("Order status updated successfully:", data.payload);

          // Immediately update formData with the new status from the backend
          setFormData({ orderStatus: data.payload.orderStatus });

          // Fetch updated order details
          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin()); // Refresh orders list
        } else {
          console.error("Failed to update order status:", data);
        }
      })
      .catch((error) => {
        console.error("Error during status update:", error);
      });
  };

  return (
    <div className="sm:max-w-[1000px] w-full h-full flex flex-col">
      <div className="grid gap-6 flex-1">
        {/* Order Info */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between mt-6">
            <p className="font-medium">Order Id</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.orderDate?.split("T")[0]}</Label>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="font-medium">Order Status</p>
            <Badge
              className={`py-1 px-3 rounded text-white ${formData.orderStatus === "confirmed" ? "bg-green-500" : formData.orderStatus === "shipped" ? "bg-blue-500" : formData.orderStatus === "processing" ? "bg-gray-500" : formData.orderStatus === "rejected" ? "bg-red-500" : formData.orderStatus === "rejected" ? "bg-red-500" : formData.orderStatus === "outForDelivery" ? "bg-orange-500" : "bg-black"}`}
            >
              {formData.orderStatus}
            </Badge> 
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="font-medium">Amount</p>
            <Label>${orderDetails?.totalAmount}</Label>
          </div>
        </div>

        <hr className="h-[3px]" />

        {/* Order Details */}
        <div className="grid gap-4">
          <h2 className="font-semibold">Order Details</h2>
          <ul className="grid gap-3">
            {orderDetails?.cartItems?.length > 0 &&
              orderDetails.cartItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{item?.title}</span>
                  <span>Quantity: {item?.quantity}</span>
                  <span>${item?.price}</span>
                </li>
              ))}
          </ul>
        </div>

        {/* Delivery Info */}
        <div className="grid gap-4">
          <h2 className="font-semibold">Delivery Info</h2>
          <div className="grid gap-1/2 text-muted-foreground">
            <span>Name: {user?.userName}</span>
            <span>Address: {orderDetails?.addressInfo?.address}</span>
            <span>City: {orderDetails?.addressInfo?.city}</span>
            <span>Zipcode: {orderDetails?.addressInfo?.zipcode}</span>
            <span>Phone: {orderDetails?.addressInfo?.phone}</span>
            <span>Notes: {orderDetails?.addressInfo?.notes}</span>
          </div>
        </div>

        {/* Form to update Order Status */}
        <form onSubmit={handleUpdateStatus} className="grid gap-4">
          <div className="flex items-center justify-between mt-2">
            <p className="font-medium">Order Status</p>
            <select
              name="orderStatus"
              value={formData.orderStatus}
              onChange={handleChange}
              className="py-2 px-4 border-2 border-gray-300 rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="outForDelivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded">
            Update Status
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
