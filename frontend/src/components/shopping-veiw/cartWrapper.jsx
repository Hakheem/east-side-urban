import React, { useEffect } from "react";
import { Button } from "../ui/button";
import CartContents from "./cartContents";
import { SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { useToast } from "@/hooks/use-toast";
import { fetchCartItems } from "@/store/shop/cartSlice";

const CartWrapper = ({ setOpenCartSheet }) => {
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const { toast } = useToast();
  const dispatch = useDispatch()

  // Map cart items with product details
  const enrichedCartItems = cartItems.map((cartItem) => {
    const product = productList?.find(
      (p) => String(p._id) === String(cartItem.productId)
    );

    return {
      ...cartItem,
      ...(product || {}),
      stock: product?.totalStock ?? cartItem.stock ?? 0,
      id: cartItem.productId,
    };
  });

  useEffect(() => {
    if (!productList || productList.length === 0) {
      dispatch(fetchCartItems());
    }
  }, []);

  const DELIVERY_FEE = 200;
  const subtotal = enrichedCartItems.reduce(
    (acc, item) =>
      acc + (item.salePrice > 0 ? item.salePrice : item.price) * item.quantity,
    0
  );
  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Shopping Cart</SheetTitle>
        <SheetDescription>
          {enrichedCartItems.length} item
          {enrichedCartItems.length !== 1 ? "s" : ""} in cart
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
        {enrichedCartItems.length > 0 ? (
          enrichedCartItems.map((item) => (
            <CartContents key={item.id} cartItem={item} />
          ))
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Your cart is empty
          </p>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal</span>
            <span className="font-medium">Ksh. {subtotal.toFixed(2)}</span>
          </div>

          {enrichedCartItems.length > 0 && (
            <div className="flex justify-between">
              <span className="text-sm">Delivery Fee</span>
              <span className="font-medium">
                Ksh. {DELIVERY_FEE.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between mb-4">
          <span className="font-bold">Total</span>
          <span className="font-bold">Ksh. {total.toFixed(2)}</span>
        </div>

        <Button
          onClick={() => {
            if (enrichedCartItems.length === 0) {
              toast({
                title: "Empty Cart",
                description:
                  "Your cart is empty. Add items to proceed to checkout.",
                variant: "destructive",
              });
              return;
            }
            navigate("/checkout");
            setOpenCartSheet(false);
          }}
          className="w-full"
        >
          Proceed to Checkout (Ksh. {total.toFixed(2)})
        </Button>
      </div>
    </div>
  );
};

export default CartWrapper;
