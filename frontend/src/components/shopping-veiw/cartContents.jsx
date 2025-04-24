import React from "react";
import { Button } from "../ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { deleteCartItem, updateCartItemsQty } from "@/store/shop/cartSlice";

const CartContents = ({ cartItem }) => {
  const dispatch = useDispatch(); 
  const { toast } = useToast();

  const currentQty = cartItem.quantity || 0;
  const availableStock = Number(cartItem?.stock || 0);
  const displayPrice =
    cartItem?.salePrice && cartItem.salePrice > 0
      ? cartItem.salePrice
      : cartItem.price;
  const totalPrice = (displayPrice * currentQty).toFixed(2);

  const handleDeleteCartItem = async () => {
    try {
      await dispatch(deleteCartItem(cartItem.productId)).unwrap();
      toast({
        title: "🗑️ Removed",
        description: `${cartItem.title} removed from cart`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (type) => {
    try {
      if (type === "plus" && currentQty >= availableStock) {
        toast({
          title: "⚠️ Stock limit reached ",
          description: `Only ${availableStock} available in stock`,
          variant: "info",
        });
        return;
      }

      if (type === "minus" && currentQty <= 1) {
        toast({
          title: "⚠️ Minimum quantity",
          description: "Quantity can't be less than 1",
          variant: "info",
        });
        return;
      }

      const newQty = type === "plus" ? currentQty + 1 : currentQty - 1;
      await dispatch(
        updateCartItemsQty({
          productId: cartItem.productId,
          quantity: newQty,
        })
      ).unwrap();
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.image || ""}
        alt={cartItem?.title || "Product"}
        className="object-cover h-20 w-20 rounded"
      />

      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem.title}</h3>
        <div className="flex mt-1 items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => handleUpdateQuantity("minus")}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="font-semibold">{currentQty}</span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8"
            onClick={() => handleUpdateQuantity("plus")}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <p className="font-semibold">${totalPrice}</p>
        <Trash
          onClick={handleDeleteCartItem}
          className="cursor-pointer mt-1 size-5 text-red-500 hover:text-red-700"
        />
      </div>
    </div>
  );
};

export default CartContents;
