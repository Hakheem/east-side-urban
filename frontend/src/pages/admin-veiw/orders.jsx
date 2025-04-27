import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetAdminOrderDetails,
} from "@/store/admin/adminOrderSlice";
import { Badge } from "@/components/ui/badge";
import AdminOrderDetails from "./adminOrderDetails";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  pending: {
    color: "bg-amber-100 text-amber-800",
    icon: "⏳",
  },
  processing: {
    color: "bg-blue-100 text-blue-800",
    icon: "🔄",
  },
  shipped: {
    color: "bg-indigo-100 text-indigo-800",
    icon: "🚚",
  },
  outForDelivery: {
    color: "bg-purple-100 text-purple-800",
    icon: "📦",
  },
  delivered: {
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: "❌",
  },
};

const formatAmount = (amount, paymentMethod = "") => {
  if (!amount) return "Ksh.0.00";
  const numericAmount = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(numericAmount)) return "Invalid Amount";

  if (paymentMethod?.toLowerCase() === "paypal") {
    return `Ksh.${(numericAmount * 125).toFixed(2)} (PayPal)`;
  }
  return `Ksh.${numericAmount.toFixed(2)}`;
};

const AdminOrders = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { orderList, orderDetails, isLoading } = useSelector((state) => state.adminOrder);

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderDetailsForAdmin(orderId));
    setOpenDetailsDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailsDialog(false);
    dispatch(resetAdminOrderDetails());
  };

  const handleRefresh = () => {
    dispatch(getAllOrdersForAdmin());
    toast({
      title: "Orders Refreshed",
      description: "Order list has been updated",
    });
  };

  const sortedOrders = Array.isArray(orderList) 
    ? orderList.slice().sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate) : new Date(0);
        const dateB = b.orderDate ? new Date(b.orderDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
    : [];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Order Management</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedOrders.length > 0 ? (
              sortedOrders.map((order) => (
                <TableRow key={order._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{order._id}</TableCell>
                  <TableCell>
                    {order.user?.username || order.user?.email || "Guest"}
                  </TableCell>
                  <TableCell>
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${statusConfig[order.orderStatus]?.color || 'bg-gray-100 text-gray-800'} py-1 px-2 text-xs`}
                    >
                      <span className="mr-1">{statusConfig[order.orderStatus]?.icon || '?'}</span>
                      {order.orderStatus || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAmount(order.totalAmount, order.paymentMethod)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewDetails(order._id)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={openDetailsDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {orderDetails ? (
            <AdminOrderDetails orderDetails={orderDetails} />
          ) : (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminOrders;