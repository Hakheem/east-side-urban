import Form from '@/components/common/Form';
import { DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const OrderDetails = () => {
  return (
    <DialogContent className="sm:max-w-[600px]">
    <div className="grid gap-6">
      {/* Order Info */}
      <div className="grid gap-2">
        <div className="flex items-center justify-between mt-6">
          <p className="font-medium">Order Id</p>
          <Label>000129</Label>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">Order Date</p>
          <Label>22/22/2224</Label>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">Order Status</p>
          <Label>{formData.orderStatus || 'On Transit'}</Label>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="font-medium">Amount</p>
          <Label>$129</Label>
        </div>
      </div>
      <hr className="h-[3px]" />

      {/* Order Details */}
      <div className="grid gap-4">
        <h2 className="font-semibold">Order Details</h2>
        <ul className="grid gap-3">
          <li className="flex items-center justify-between">
            <span>Item one</span>
            <span>$456</span>
          </li>
        </ul>
      </div>

      {/* Delivery Info */}
      <div className="grid gap-4">
        <h2 className="font-semibold">Delivery Info</h2>
        <div className="grid gap-1/2 text-muted-foreground">
          <span>Name:  </span>
          <span>Address: </span>
          <span>City: </span>
          <span>Zipcode: </span>
          <span>Phone: </span>
          <span>Notes: </span>
        </div>
      </div>

      <Form
formControls={[
{
  label: "Order status",
  name: "orderStatus",
  componentType: "select",
  options: [
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "outForDelivery", label: "Out for Delivery" },
    { id: "delivered", label: "Delivered" },
  ],
},
]}
formData={formData}
setFormData={setFormData}
buttonText="Update Order Status"
onSubmit={updateOrderStatus}
/>

    </div>
  </DialogContent>
  )
}

export default OrderDetails