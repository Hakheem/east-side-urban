import React, { useEffect } from "react";
import { Button } from "../ui/button";
import CartContents from "./cartContents";
import { SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { fetchCartItems } from "@/store/shop/cartSlice";
import { ShoppingBag, AlertCircle } from "lucide-react";

const CartWrapper = ({ setOpenCartSheet }) => {
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cartItems, error } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Enhanced cart item enrichment with proper ID handling
  const enrichedCartItems = cartItems.map((cartItem) => {
    const product = productList.find(
      (p) => p?._id?.toString() === cartItem?.productId?.toString()
    ) || {};

    // Create a unique key that combines product ID and variant if exists
    const uniqueKey = `${cartItem.productId}_${cartItem.size || ''}_${cartItem.color || ''}`;

    return {
      ...cartItem,
      title: product.title || cartItem.title || "Unknown Product",
      price: product.price ?? cartItem.price ?? 0,
      salePrice: product.salePrice ?? cartItem.salePrice ?? 0,
      image: product.image || cartItem.image || "/default-product.jpg",
      totalStock: product.totalStock ?? cartItem.totalStock ?? 0,
      uniqueKey,
    };
  });

  const DELIVERY_FEE = 200;
  const subtotal = enrichedCartItems.reduce((total, item) => {
    const price = item.salePrice > 0 ? item.salePrice : item.price;
    return total + price * item.quantity;
  }, 0);
  const total = subtotal + DELIVERY_FEE;

  const EmptyCartState = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
      <ShoppingBag className="w-12 h-12 text-gray-400" />
      <h3 className="text-lg font-medium">Your cart is empty</h3>
      <p className="text-muted-foreground">Browse our products to add items</p>
      <Button
        variant="outline"
        onClick={() => setOpenCartSheet(false)}
        className="mt-4"
      >
        Continue Shopping
      </Button>
    </div>
  );

  // Modified CartItem component with refresh after delete
  const CartItem = ({ item }) => {
    const handleDeleteSuccess = () => {
      dispatch(fetchCartItems()); // Refresh cart after deletion
    };

    return (
      <CartContents 
        cartItem={item} 
        onDeleteSuccess={handleDeleteSuccess}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Shopping Cart</SheetTitle>
        <SheetDescription>
          {enrichedCartItems.length} item
          {enrichedCartItems.length !== 1 ? "s" : ""} in cart
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto mt-4">
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md mx-2 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{error.toString()}</span>
          </div>
        )}

        {enrichedCartItems.length > 0 ? (
          <div className="divide-y">
            {enrichedCartItems.map((item) => (
              <CartItem 
                key={item.uniqueKey} 
                item={item} 
              />
            ))}
          </div>
        ) : (
          <EmptyCartState />
        )}
      </div>

      {enrichedCartItems.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="font-medium">Ksh. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Delivery Fee</span>
              <span className="font-medium">
                Ksh. {DELIVERY_FEE.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-between mb-4">
            <span className="font-bold">Total</span>
            <span className="font-bold">Ksh. {total.toFixed(2)}</span>
          </div>

          <Button
            onClick={() => {
              navigate("/checkout");
              setOpenCartSheet(false);
            }}
            className="w-full"
            disabled={enrichedCartItems.length === 0}
          >
            Proceed to Checkout (Ksh. {total.toFixed(2)})
          </Button>
        </div>
      )}
    </div>
  );
};

export default CartWrapper;