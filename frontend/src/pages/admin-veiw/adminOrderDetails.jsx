import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";  // Updated to use Shadcn Badge
import Form from "@/components/common/Form";
import { getAllOrdersForAdmin, getOrderDetailsForAdmin, updateOrderStatusForAdmin } from "@/store/admin/adminOrderSlice"; 

const AdminOrderDetails = ({ orderDetails }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    orderStatus: orderDetails?.orderStatus || "confirmed",  
  });

  // Only update formData when orderDetails changes (initial load)
  useEffect(() => {
    if (orderDetails && orderDetails?.orderStatus !== formData.orderStatus) {
      setFormData({
        orderStatus: orderDetails?.orderStatus || "confirmed",
      });
    }
  }, [orderDetails]);

  const handleUpdateStatus = (event) => {
    event.preventDefault();
    const { orderStatus } = formData; 

    console.log("Updating order status to:", orderStatus);
    
    dispatch(updateOrderStatusForAdmin({ id: orderDetails?._id, status: orderStatus }))
      .then((data) => {
        if (data?.payload?.success) {
          console.log("Order status updated successfully:", data.payload);

          // After status update, directly update formData with the new order status
          setFormData({ orderStatus });  // Manually update formData
          
          // Dispatch getOrderDetailsForAdmin to fetch the updated order
          dispatch(getOrderDetailsForAdmin(orderDetails?._id)).then((res) => {
            // Ensure formData is updated with the new orderStatus after fetch
            setFormData({
              orderStatus: res?.payload?.data?.orderStatus || orderStatus,  // Update if needed
            });
          });
          
          // Dispatch getAllOrdersForAdmin to update the orders list in AdminOrders
          dispatch(getAllOrdersForAdmin());
        } else {
          console.error("Failed to update order status:", data);
        }
      })
      .catch((error) => {
        console.error('Error during status update:', error);
      });
  };

  console.log("Current formData:", formData);

  return (
    <div className="sm:max-w-[700px] h-[90vh] overflow-y-scroll flex flex-col">
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
              className={`py-1 px-3 rounded text-white ${formData.orderStatus === "confirmed"
                  ? "bg-green-500"
                  : formData.orderStatus === "shipped"
                  ? "bg-blue-500"
                  : formData.orderStatus === "rejected"
                  ? "bg-red-500"
                  : formData.orderStatus === "outForDelivery"
                  ? "bg-yellow-500"  // Added outForDelivery color
                  : "bg-black"
              }`}
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
            {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
              orderDetails?.cartItems?.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{item?.title}</span>
                  <span>Quantity: {item?.quantity}</span>
                  <span>${item?.price}</span>
                </li>
              ))
            ) : null}
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
        <Form
          formControls={[{
            label: "Order status",
            name: "orderStatus",
            componentType: "select",
            options: [
              { id: "pending", label: "Pending" },
              { id: "processing", label: "Processing" },
              { id: "shipped", label: "Shipped" },
              { id: "outForDelivery", label: "Out for Delivery" },
              { id: "delivered", label: "Delivered" },
              { id: "rejected", label: "Rejected" },  // Added rejected status option
            ],
          }]}

          formData={formData}
          setFormData={setFormData}
          buttonText="Update Order Status"
          onSubmit={handleUpdateStatus}
        />
      </div>
    </div>
  );
};

export default AdminOrderDetails;
