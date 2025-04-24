import { DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  MapPin,
  User,
  ShoppingCart,
} from "lucide-react";

const statusColors = {
  processing: "bg-gray-500",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
  outForDelivery: "bg-orange-500",
  default: "bg-cyan-500",
};

// Helper: Format any number safely to 2 decimal places
const formatPrice = (value) => Number(value || 0).toFixed(2);

// Helper: Adjust totalAmount based on payment method
const getDisplayTotalAmount = (amount, method) => {
  if (typeof method === "string" && method.toLowerCase() === "paypal") {
    return formatPrice(amount * 125);
  }
  return formatPrice(amount);
};

const OrderDetails = ({ orderDetails }) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    orderStatus: orderDetails?.orderStatus || "On Transit",
  });

  useEffect(() => {
    if (orderDetails) {
      setFormData({
        orderStatus: orderDetails?.orderStatus || "On Transit",
      });
    }
  }, [orderDetails]);

  if (!orderDetails)
    return (
      <DialogContent className="sm:max-w-[700px]">
        <div className="text-center py-8">Loading order details...</div>
      </DialogContent>
    );

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <div className="space-y-6">
        {/* Order Header */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{orderDetails._id.slice(-8).toUpperCase()}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(orderDetails.orderDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <Badge
            className={`py-1.5 px-3 rounded-full text-white ${
              statusColors[orderDetails.orderStatus] || statusColors.default
            }`}
          >
            {orderDetails.orderStatus?.charAt(0).toUpperCase() +
              orderDetails.orderStatus?.slice(1)}
          </Badge>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Payment Method</Label>
            <p className="font-medium capitalize">
              {orderDetails.paymentMethod}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Payment Status</Label>
            <p className="font-medium capitalize">
              {orderDetails.paymentStatus}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground">Total Amount</Label>
            <p className="font-bold">
              Ksh.
              {getDisplayTotalAmount(
                orderDetails.totalAmount,
                orderDetails.paymentMethod
              )}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Products ({orderDetails.cartItems?.length || 0})
          </h3>
          <div className="space-y-3">
            {orderDetails.cartItems?.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-3 border rounded-lg"
              >
                <div className="bg-gray-100 dark:bg-gray-800 rounded-md w-16 h-16 flex-shrink-0 overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                    <span>Qty: {item.quantity}</span>
                    <span>Ksh.{formatPrice(item.price)} each</span>
                  </div>
                </div>
                <div className="font-medium">
                  Ksh.{formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Information
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <p>{user?.userName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="text-muted-foreground">
                  Shipping Address
                </Label>
                <p>{orderDetails.addressInfo?.address}</p>
                <p>
                  {orderDetails.addressInfo?.city},{" "}
                  {orderDetails.addressInfo?.zipcode}
                </p>
                <p>{orderDetails.addressInfo?.phone}</p>
                {orderDetails.addressInfo?.notes && (
                  <p className="mt-2">
                    <span className="text-muted-foreground">Notes: </span>
                    {orderDetails.addressInfo?.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default OrderDetails;
