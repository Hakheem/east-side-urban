import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatusForAdmin,
} from "@/store/admin/adminOrderSlice";
import { useToast } from "@/hooks/use-toast";

const initialFormData = {
  orderStatus: "",
};

const formatAmount = (amount, method = "") => {
  const numericAmount =
    typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(numericAmount)) return "Invalid Amount";

  if (method?.toLowerCase() === "paypal") {
    return `Ksh.${(numericAmount * 125).toFixed(2)} (PayPal)`;
  }

  return `Ksh.${numericAmount.toFixed(2)}`;
};

const AdminOrderDetails = ({ orderDetails }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState(initialFormData);

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

    dispatch(
      updateOrderStatusForAdmin({
        id: orderDetails?._id,
        orderStatus: formData.orderStatus,
      })
    )
      .then((data) => {
        const success = data?.payload?.success;
        const updatedStatus =
          data?.payload?.orderStatus || formData.orderStatus;

        if (success) {
          toast({
            title: "✅ Order Updated",
            description: `Order status changed to "${updatedStatus}" 🎉`,
            variant: "success",
          });

          setFormData({ orderStatus: updatedStatus });

          dispatch(getOrderDetailsForAdmin(orderDetails?._id));
          dispatch(getAllOrdersForAdmin());
        } else {
          toast({
            title: "⚠️ Update Failed",
            description: "Could not update the order status. Try again.",
            variant: "destructive",
          });
        }
      })
      .catch(() => {
        toast({
          title: "❌ Error",
          description: "Something went wrong while updating the order.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="sm:max-w-[1000px] w-full h-[90vh] overflow-scroll flex flex-col px-6 py-4">
      <div className="grid gap-6 flex-1">
        {/* Order Info */}
        <div className="grid gap-4 border-b pb-4">
          <h2 className="text-lg font-semibold">📦 Order Information</h2>
          <div className="flex items-center justify-between">
            <p className="font-medium">Order ID:</p>
            <Label>{orderDetails?._id}</Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Order Date:</p>
            <Label>
              {orderDetails?.orderDate
                ? new Date(orderDetails.orderDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Order Status:</p>
            <Badge
              className={`py-1 px-3 rounded text-white ${
                formData.orderStatus === "confirmed"
                  ? "bg-green-500"
                  : formData.orderStatus === "shipped"
                  ? "bg-blue-500"
                  : formData.orderStatus === "processing"
                  ? "bg-gray-500"
                  : formData.orderStatus === "rejected"
                  ? "bg-red-500"
                  : formData.orderStatus === "outForDelivery"
                  ? "bg-orange-500"
                  : formData.orderStatus === "delivered"
                  ? "bg-emerald-600"
                  : "bg-black"
              }`}
            >
              {formData.orderStatus}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Total Amount:</p>
            <Label>
              {formatAmount(
                orderDetails?.totalAmount,
                orderDetails?.paymentMethod
              )}
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Method:</p>
            <Label className="capitalize">
              {orderDetails?.paymentMethod || "N/A"}
            </Label>
          </div>
        </div>

        {/* Products */}
        <div className="grid gap-4">
          <h2 className="text-lg font-semibold">🛒 Ordered Items</h2>
          <ul className="grid gap-3">
            {orderDetails?.cartItems?.length > 0 &&
              orderDetails.cartItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md"
                >
                  <span className="font-medium">{item?.title}</span>
                  <span>Qty: {item?.quantity}</span>
                  <span>
                    Unit:{" "}
                    {formatAmount(item?.price, orderDetails?.paymentMethod)}
                  </span>
                </li>
              ))}
          </ul>
        </div>

        {/* Delivery Info */}
        <div className="grid gap-4 border-t pt-4">
          <h2 className="text-lg font-semibold">🚚 Delivery Information</h2>
          <div className="grid gap-1 text-muted-foreground">
            <span>
              <strong>Name:</strong> {user?.userName}
            </span>
            <span>
              <strong>Address:</strong> {orderDetails?.addressInfo?.address}
            </span>
            <span>
              <strong>City:</strong> {orderDetails?.addressInfo?.city}
            </span>
            <span>
              <strong>Zipcode:</strong> {orderDetails?.addressInfo?.zipcode}
            </span>
            <span>
              <strong>Phone:</strong> {orderDetails?.addressInfo?.phone}
            </span>
            {orderDetails?.addressInfo?.notes && (
              <span>
                <strong>Notes:</strong> {orderDetails?.addressInfo?.notes}
              </span>
            )}
          </div>
        </div>

        {/* Update Order Status */}
        <form
          onSubmit={handleUpdateStatus}
          className="grid gap-4 border-t pt-4"
        >
          <h2 className="text-lg font-semibold">📝 Update Status</h2>
          <select
            name="orderStatus"
            value={formData.orderStatus}
            onChange={handleChange}
            className="py-2 px-4 border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="outForDelivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
          >
            Update Order Status
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
