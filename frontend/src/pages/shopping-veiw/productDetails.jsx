import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { setProductDetails } from "@/store/shop/shopProductsSlice";
import { IoMdStar, IoMdStarHalf } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const ProductDetails = ({ open, setOpen, productDetails }) => {
  if (!productDetails) return null;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);

  // Handle add to cart functionality
  const handleAddToCart = (currentId, getTotalStock) => {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === currentId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity >= getTotalStock) {
          toast.info("Product quantity in cart exceeds available stock", {
            position: "top-center",
          });
          return;
        }
      }
    }

    if (!user?.id) return;

    dispatch(
      addToCart({
        userId: user.id,
        productId: currentId,
        quantity: 1,
      })
    )
      .then((data) => {
        if (data?.payload.success) {
          dispatch(fetchCartItems(user.id));
          toast.success("Product added to cart", {
            position: "top-center",
          });
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  };

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 overflow-auto lg:h-[35rem] gap-6 p-4 sm:p-6 lg:gap-8 sm:max-w-[90vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="object-cover w-full aspect-square"
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {productDetails?.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {productDetails?.description}
          </p>

          <div className="flex items-center justify-between">
            <p
              className={`text-xl sm:text-2xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-xl sm:text-2xl font-bold text-red-500">
                ${productDetails.salePrice}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 items-center mt-2">
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStarHalf className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
            </div>
            <span className="text-sm sm:text-base text-muted-foreground">
              (4.5)
            </span>
          </div>

          <div className="mt-4">
            {productDetails?.totalStock === 0 ? (
              <Button disabled className="w-full">
                Out of stock
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </div>

          <hr className="mt-6 h-[2px]" />

          <div className="max-h-[200px] sm:max-h-[300px] overflow-auto">
            <h2 className="text-lg sm:text-xl font-bold capitalize mb-4">
              Reviews
            </h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border">
                  <AvatarFallback>HH</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h3 className="font-bold">Hakheem Hakheem</h3>
                  <div className="flex gap-0.5 items-center">
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStarHalf className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    The shoe is awesome. Well stitched, unique and affordable
                    too.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Input placeholder="Leave a review..." />
            <Button>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;
