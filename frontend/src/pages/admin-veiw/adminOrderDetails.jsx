// AdminOrderDetails.jsx
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "outForDelivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "rejected", label: "Rejected" },
];

const formatAmount = (amount, method = "") => {
  const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
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
  const [formData, setFormData] = useState({ orderStatus: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (orderDetails) {
      setFormData({ orderStatus: orderDetails.orderStatus || "" });
    }
  }, [orderDetails]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const result = await dispatch(
        updateOrderStatusForAdmin({
          id: orderDetails._id,
          orderStatus: formData.orderStatus,
        })
      );

      if (result?.payload?.success) {
        toast({
          title: "Status Updated",
          description: `Order status changed to ${formData.orderStatus}`,
        });
        dispatch(getOrderDetailsForAdmin(orderDetails._id));
        dispatch(getAllOrdersForAdmin());
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Order #{orderDetails?._id}</h2>
        
        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span>
                {new Date(orderDetails?.orderDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant={
                formData.orderStatus === "delivered" ? "success" :
                formData.orderStatus === "shipped" ? "info" :
                formData.orderStatus === "rejected" ? "destructive" :
                "default"
              }>
                {formData.orderStatus}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">
                {formatAmount(orderDetails?.totalAmount, orderDetails?.paymentMethod)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="capitalize">
                {orderDetails?.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-4">
          <h3 className="font-semibold">Products</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orderDetails?.cartItems?.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-2">{item.title}</td>
                    <td className="px-4 py-2 text-right">
                      {formatAmount(item.price, orderDetails.paymentMethod)}
                    </td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      {formatAmount(
                        item.price * item.quantity,
                        orderDetails.paymentMethod
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="space-y-4">
          <h3 className="font-semibold">Shipping Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{user?.userName}</p>
              <p>{orderDetails?.addressInfo?.address}</p>
              <p>
                {orderDetails?.addressInfo?.city}, {orderDetails?.addressInfo?.zipcode}
              </p>
              <p>{orderDetails?.addressInfo?.phone}</p>
            </div>
            {orderDetails?.addressInfo?.notes && (
              <div>
                <p className="font-medium">Delivery Notes</p>
                <p>{orderDetails.addressInfo.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <h3 className="font-semibold">Update Status</h3>
          <div className="flex gap-4">
            <Select
              value={formData.orderStatus}
              onValueChange={(value) => setFormData({ orderStatus: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminOrderDetails;