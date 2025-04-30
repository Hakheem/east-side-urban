import React, { useState } from "react";
import { Button } from "../ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { deleteCartItem, updateCartItemsQty } from "@/store/shop/cartSlice";

const CartContents = ({ cartItem, onDeleteSuccess }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayPrice = cartItem.salePrice > 0 ? cartItem.salePrice : cartItem.price;
  const itemTotal = (displayPrice * quantity).toFixed(2);

  const handleUpdate = async (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }

    if (newQuantity > (cartItem.totalStock || Infinity)) {
      toast({
        title: "Stock Limit",
        description: `Only ${cartItem.totalStock} available`,
        variant: "info",
      });
      return;
    }

    setQuantity(newQuantity);
    try {
      await dispatch(
        updateCartItemsQty({
          productId: cartItem.productId,
          quantity: newQuantity,
        })
      ).unwrap();
    } catch (error) {
      setQuantity(cartItem.quantity);
      toast({
        title: "Update Failed",
        description: error.toString(),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const productId = cartItem.productId?._id
        ? String(cartItem.productId._id).trim()
        : String(cartItem.productId).trim();

      const result = await dispatch(deleteCartItem(productId));

      if (result.error) {
        throw result.error;
      }

      onDeleteSuccess?.();

      toast({
        title: "Removed",
        description: `${cartItem.title} was removed from cart`,
        variant: "success",
      });
    } catch (error) {
      console.error("Delete failed:", {
        error: error.message,
        cartItem,
        stack: error.stack,
      });
      toast({
        title: "Error",
        description: error.message || "Couldn't remove item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/default-product.jpg";
  };

  return (
    <div className="flex p-2 gap-3">
      <img
        src={cartItem.image || "/default-product.jpg"}
        alt={cartItem.title}
        className="w-16 h-16 object-cover rounded mr-2"
        onError={handleImageError}
      />

      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-sm text-muted-foreground">
            {cartItem.title}
          </h3>
          <p className="font-semibold text-md">Ksh.{itemTotal}</p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdate(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdate(quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartContents;
