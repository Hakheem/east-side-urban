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
import { getAllOrdersByUserId, getOrderDetails, resetOrderDetails } from "@/store/shop/shopOrdersSlice";
import { Badge } from "@/components/ui/badge";
import OrderDetails from "./orderDetails";

const Orders = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

  // Sort orders from latest to oldest (non-mutating)
  const sortedOrders = orderList ? [...orderList].sort((a, b) => new Date(b?.orderDate) - new Date(a?.orderDate)) : [];

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
            {sortedOrders?.length > 0 ? (
              sortedOrders.map((orderItem) => (
                <TableRow key={orderItem?._id}>
                  <TableCell className="font-medium">{orderItem?._id}</TableCell>
                  <TableCell>{orderItem?.orderDate.split("T")[0]}</TableCell>
                  <TableCell>
                    <Badge
                      className={`py-1 px-3 ${orderItem?.orderStatus === "confirmed" ? "bg-green-500" : "bg-black"}`}
                    >
                      {orderItem?.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{orderItem?.totalAmount}</TableCell>
                  <TableCell>
                    <Dialog open={openDetailsDialog} onOpenChange={() => {
                      setOpenDetailsDialog(false);
                      dispatch(resetOrderDetails());
                    }}>
                      <DialogTrigger asChild>
                        <Button onClick={() => handleViewDetails(orderItem?._id)}>
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        {/* Pass orderDetails to OrderDetails component */}
                        <OrderDetails orderDetails={orderDetails} />
                      </DialogContent>
                    </Dialog>
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
    </Card>
  );
};

export default Orders;
