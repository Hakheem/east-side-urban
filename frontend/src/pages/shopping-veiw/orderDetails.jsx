import { DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";  
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const OrderDetails = ({ orderDetails }) => {
  const [formData, setFormData] = useState({
    orderStatus: orderDetails?.orderStatus || "On Transit",
  });
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (orderDetails) {
      setFormData({
        orderStatus: orderDetails?.orderStatus || "On Transit",
      });
    }
  }, [orderDetails]);

  console.log(orderDetails?.orderStatus); 


  return (
    <DialogContent className="sm:max-w-[700px]">
    <div className="grid gap-6">
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
          <div
            className={`py-1 px-3 rounded text-white ${
              orderDetails?.orderStatus === "confirmed"
                ? "bg-green-500"
                : orderDetails?.orderStatus === "shipped"
                ? "bg-blue-500"
                : orderDetails?.orderStatus === "rejected"
                ? "bg-red-500"
                : "bg-black"
            }`}
          >
            {orderDetails?.orderStatus}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">Amount</p>
          <Label>${orderDetails?.totalAmount}</Label>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">Payment Method</p>
          <Label>{orderDetails?.paymentMethod}</Label>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">Payment Status</p>
          <Label>{orderDetails?.paymentStatus}</Label>
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
    </div>
  </DialogContent>
  
  );
};

export default OrderDetails;
