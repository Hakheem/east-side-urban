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
import AdminOrderDetails from "./AdminOrderDetails";

const AdminOrders = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

  const sortedOrders = orderList ? [...orderList].sort((a, b) => new Date(b?.orderDate) - new Date(a?.orderDate)) : [];

  // Refetch orders if the orderDetails are updated (order status change)
  useEffect(() => {
    if (orderDetails?.orderStatus) {
      console.log("Order status updated, fetching all orders...");
      dispatch(getAllOrdersForAdmin());
    }
  }, [orderDetails?.orderStatus, dispatch]);  // Trigger re-fetch when orderDetails change

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan="5" className="text-center">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : sortedOrders?.length > 0 ? (
              sortedOrders.map((orderItem) => (
                <TableRow key={orderItem?._id}>
                  <TableCell className="font-medium">{orderItem?._id}</TableCell>
                  <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${
                        orderItem?.orderStatus === "confirmed" ? "bg-green-500" : "bg-black"
                      }`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>${orderItem?.totalAmount}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleViewDetails(orderItem?._id)}>View Details</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog open={openDetailsDialog} onOpenChange={handleCloseDialog}>
        <DialogContent>
          {orderDetails ? (
            <AdminOrderDetails orderDetails={orderDetails} />
          ) : (
            <p>Loading details...</p>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminOrders;
