import React from "react";
import { Button } from "../ui/button";
import CartContents from "./cartContents";
import { SheetHeader, SheetTitle } from "../ui/sheet";

const CartWrapper = ({ cartItems }) => {
  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
 
  return (
    <div className="sm:max-w-md p-4">
      <SheetHeader >
        <SheetTitle >Shopping Cart</SheetTitle>
      </SheetHeader>

      <div className="mt-8 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => <CartContents key={item.id} cartItem={item} />)
        ) : (
          <p>Your cart is empty</p>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">$569</span> 
        </div>
      </div>

      <Button className="w-full mt-6">Checkout</Button>
    </div>
  );
};

export default CartWrapper;
