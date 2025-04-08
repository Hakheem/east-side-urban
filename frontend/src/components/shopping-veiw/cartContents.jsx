import React from "react";
import { Button } from "../ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import { deleteCartItem, updateCartItemsQty } from "@/store/shop/cartSlice";

const CartContents = ({ cartItem }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);

  // Handle Delete Cart Item
  function handleDeleteCartItem(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    );
    toast.info(`${getCartItem?.title} removed from cart`, {
      position: "bottom-center",
      autoClose: 2000,
    });
  }

  // Handle Update Quantity
  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (!getCartItem || !getCartItem.productId || !user?.id) return;

    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentCartItem = getCartItems.findIndex(
        (item) => item.productId === getCartItem?.productId
      );

      const getCurrentProductIndex = productList.findIndex(
        (product) => product._id === getCartItem?.productId
      );
      const getTotalStock = productList[getCurrentProductIndex]?.totalStock;

      if (indexOfCurrentCartItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;

        if (typeOfAction === "plus" && getQuantity >= getTotalStock) {
          toast.info("Product quantity in cart exceeds available stock", {
            position: "top-center",
          });
          return;
        }

        if (typeOfAction === "minus" && getQuantity <= 1) {
          toast.info("Product quantity can't be less than 1", {
            position: "top-center",
          });
          return;
        }
      }
    }

    // Dispatch action to update the cart quantity
    dispatch(
      updateCartItemsQty({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    );
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        {/* Product Image */}
        <img
          src={cartItem?.image}
          alt={cartItem?.title}
          className="object-cover h-20 w-20 rounded"
        />

        {/* Product Info */}
        <div className="flex-1">
          <h3 className="font-extrabold">{cartItem?.title}</h3>
          <div className="flex mt-1 items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              disabled={cartItem?.quantity === 1}
              onClick={() => handleUpdateQuantity(cartItem, "minus")}
            >
              <Minus className="w-4 h-4" />
              <span className="sr-only">Decrease</span>
            </Button>
            <span className="font-semibold">{cartItem?.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => handleUpdateQuantity(cartItem, "plus")}
            >
              <Plus className="w-4 h-4" />
              <span className="sr-only">Increase</span>
            </Button>
          </div>
        </div>

        {/* Price & Delete */}
        <div className="flex flex-col items-end">
          <p className="font-semibold">
            $
            {(
              (cartItem?.salePrice > 0
                ? cartItem?.salePrice
                : cartItem?.price) * cartItem?.quantity
            ).toFixed(2)}
          </p>
          <Trash
            onClick={() => handleDeleteCartItem(cartItem)}
            className="cursor-pointer mt-1 size-5"
          />
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default CartContents;
