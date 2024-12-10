import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const Orders = () => {
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
      <TableHead className="w-[100px]">Order Id</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead className="text-right">
        <span className="sr-only ">Details</span>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>22/22/2222</TableCell>
      <TableCell> On transit</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
      <TableCell className="text-right">
        <Button>
          View Details
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
   </Table>
      </CardContent>
    </Card>


  
  )
}

export default Orders