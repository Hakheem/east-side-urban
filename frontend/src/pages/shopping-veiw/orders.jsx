import { useState } from "react";
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

const Orders = () => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

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
            {/* Example row */}
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>22/22/2222</TableCell>
              <TableCell>On transit</TableCell>
              <TableCell>$250.00</TableCell>
              <TableCell>
                <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
                  <DialogTrigger asChild>
                    <Button>View Details</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <div className="space-y-6">
                      <h2 className="text-lg font-bold">Order Details</h2>

                      {/* Order Info */}
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Order ID</p>
                        <p>INV001</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Order Date</p>
                        <p>22/22/2222</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Status</p>
                        <p>On transit</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Amount</p>
                        <p>$250.00</p>
                      </div>

                      <div>
                        <h3 className="font-semibold">Items Delivered</h3>
                        <ul className="mt-2 space-y-1">
                          <li className="flex justify-between">
                            <span>Item One</span>
                            <span>$150.00</span>
                          </li>
                          <li className="flex justify-between">
                            <span>Item Two</span>
                            <span>$100.00</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold">Delivery Address</h3>
                        <div className="mt-2 text-muted-foreground">
                          <p>Name: John Doe</p>
                          <p>Address: 123 Main St</p>
                          <p>City: Springfield</p>
                          <p>Zipcode: 12345</p>
                          <p>Phone: 123-456-7890</p>
                          <p>Notes: Leave at the front door</p>
                        </div>
                      </div>

                      <Button className="mt-4" onClick={() => setOpenDetailsDialog(false)}>
                        Close
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Orders;
