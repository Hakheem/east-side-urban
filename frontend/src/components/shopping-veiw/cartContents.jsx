import React from "react";
import { Button } from "../ui/button";
import { Minus, Plus, Trash } from "lucide-react";

const CartContents = (cartItem) => {
  return (
    <div className="flex items-center space-x-4 ">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="object-cover h-20 w-20 rounded "
      />
      <div className="flex-1 ">
        <h3 className="font-extrabold ">{cartItem?.title}</h3>
        <div className="flex mt-1 items-center gap-2 ">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 "
          >
            <Minus className="w-4 h-4 " />
            <span className="sr-only">Remove</span>
          </Button>

          <span className="font-semibold ">{cartItem?.quantity}</span>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 "
          >
            <Plus className="w-4 h-4 " />
            <span className="sr-only">Add</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end ">
        <p className="font-semibold ">
          $
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Trash className="cursor-pointer mt-1 size-5 " />
      </div>
    </div>
  );
};

export default CartContents;
