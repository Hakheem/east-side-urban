import React from "react";
import { Button } from "../ui/button";
import CartContents from "./CartContents";
import { SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { useNavigate } from "react-router-dom";

const CartWrapper = ({ cartItems, setOpenCartSheet }) => {
  // Calculate the total cost of the cart
  const total = cartItems.reduce(
    (acc, item) =>
      acc +
      (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
    0
  );

  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SheetHeader>
        <SheetTitle>Shopping Cart</SheetTitle>
        <SheetDescription>Your selected items</SheetDescription>
      </SheetHeader>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <CartContents key={item.id} cartItem={item} />
          ))
        ) : (
          <p>Your cart is empty</p>
        )}
      </div>

      {/* Total Price and Checkout */}
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
        <Button 
        onClick={()=>{ 
          navigate('/checkout')
           setOpenCartSheet(false)} }
           className="w-full mt-4">Checkout</Button>
      </div>
    </div>
  );
};

export default CartWrapper;
