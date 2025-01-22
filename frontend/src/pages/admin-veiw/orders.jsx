import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Dialog } from '@/components/ui/dialog'

import {
  Table,
  TableBody,
  TableCell, 
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import AdminOrdersDetails from './adminOrderDetails'

const adminOrders = () => {

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
   
  return ( 
    <Card>
    <CardHeader>
<CardTitle>
Orders History
</CardTitle>
    </CardHeader>
    <CardContent>
  <Table>
<TableHeader>
  <TableRow>
    <TableHead className="">Order Id</TableHead>
    <TableHead>Date</TableHead>
    <TableHead>Status</TableHead>
    <TableHead className="">Amount</TableHead>
    <TableHead className="">
      <span className="sr-only ">Details</span>
    </TableHead>
  </TableRow> 
</TableHeader>
<TableBody>
  <TableRow>
    <TableCell className="font-medium">INV001</TableCell>
    <TableCell>22/22/2222</TableCell>
    <TableCell> On transit</TableCell>
    <TableCell className="">$250.00</TableCell>
    <TableCell className="">
      <Dialog
      open={openDetailsDialog}
      onOpenChange={setOpenDetailsDialog}
      >

      <Button
      onClick={() => setOpenDetailsDialog(true)}
      >
        View Details
      </Button >
      <AdminOrdersDetails/>
      </Dialog>
    </TableCell>
  </TableRow>
</TableBody>
 </Table>
    </CardContent>
  </Card>
  )
}

export default adminOrders