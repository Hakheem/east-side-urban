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
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/shopOrdersSlice";
import { Badge } from "@/components/ui/badge";
import OrderDetails from "./orderDetails";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

const statusIcons = {
  processing: <Clock className="h-4 w-4 mr-2" />,
  confirmed: <Package className="h-4 w-4 mr-2" />,
  shipped: <Truck className="h-4 w-4 mr-2" />,
  delivered: <CheckCircle className="h-4 w-4 mr-2" />,
  cancelled: <XCircle className="h-4 w-4 mr-2" />,
  outForDelivery: <Truck className="h-4 w-4 mr-2" />
};

const statusColors = {
  processing: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  outForDelivery: "bg-orange-100 text-orange-800"
};

const Orders = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (selectedOrderId) {
      dispatch(getOrderDetails(selectedOrderId));
      setOpenDetailsDialog(true);
    }
  }, [selectedOrderId, dispatch]);

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  const filteredOrders = orderList?.filter(order => {
    if (activeFilter === "all") return true;
    return order?.orderStatus === activeFilter;
  });

  const sortedOrders = filteredOrders
  ? [...filteredOrders].sort(
      (a, b) => new Date(b?.orderDate) - new Date(a?.orderDate)
    )
  : []; 


  return (
    <div className="space-y-6">
      {/* Order Status Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => setActiveFilter("all")}
        >
          All Orders
        </Button>
        <Button
          variant={activeFilter === "processing" ? "default" : "outline"}
          onClick={() => setActiveFilter("processing")}
        >
          Processing
        </Button>
        <Button
          variant={activeFilter === "confirmed" ? "default" : "outline"}
          onClick={() => setActiveFilter("confirmed")}
        >
          Confirmed
        </Button>
        <Button
          variant={activeFilter === "shipped" ? "default" : "outline"}
          onClick={() => setActiveFilter("shipped")}
        >
          Shipped
        </Button>
        <Button
          variant={activeFilter === "delivered" ? "default" : "outline"}
          onClick={() => setActiveFilter("delivered")}
        >
          Delivered
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            {activeFilter === "all" ? "All Orders" : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Orders`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[150px]">Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders?.length > 0 ? (
                  sortedOrders.map((orderItem) => (
                    <TableRow key={orderItem?._id}>
                      <TableCell className="font-medium">
                        #{orderItem?.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {new Date(orderItem?.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`py-1 px-3 rounded-full ${statusColors[orderItem?.orderStatus] || "bg-gray-100 text-gray-800"}`}
                        >
                          <div className="flex items-center">
                            {statusIcons[orderItem?.orderStatus] || statusIcons.processing}
                            {orderItem?.orderStatus?.charAt(0).toUpperCase() + orderItem?.orderStatus?.slice(1) || "Pending"}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${orderItem?.totalAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog
                          open={openDetailsDialog}
                          onOpenChange={() => {
                            setOpenDetailsDialog(false);
                            dispatch(resetOrderDetails());
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(orderItem?._id)}
                            >
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <OrderDetails orderDetails={orderDetails} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {activeFilter === "all" 
                        ? "You haven't placed any orders yet."
                        : `No ${activeFilter} orders found.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;