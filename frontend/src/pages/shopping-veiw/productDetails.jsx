import Ratings from "@/components/common/Ratings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { addNewReview, getReviews } from "@/store/shop/reviewSlice";
import { setProductDetails } from "@/store/shop/shopProductsSlice";
import { useEffect, useState } from "react";
import { IoMdStar, IoMdStarHalf } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
const ProductDetails = ({ open, setOpen, productDetails }) => {
  if (!productDetails) return null;

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews: getProductReview } = useSelector(
    (state) => state.shopReviews
  );

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

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddReview() {
    dispatch(
      addNewReview({
        productId: productDetails._id,
        reviewMessage: reviewMsg,
        reviewValue: rating,
        userId: user.id,
        userName: user.userName,
      })
    )
      .then((response) => {
        if (response?.payload?.success || response?.success) {
          dispatch(getReviews(productDetails._id));
          toast.success("Review added successfully", {
            position: "top-center",
          });
          setReviewMsg("");
          setRating(0);
        } else {
          const errorMsg =
            response?.payload?.message ||
            response?.error?.message ||
            "Review submitted but no success flag";
          toast.warning(errorMsg);
        }
      })
      .catch((error) => {
        console.error("Review submission failed:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to submit review"
        );
      });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const totalReviews = getProductReview.length;

  const averageReviewsValue =
    totalReviews > 0
      ? getProductReview.reduce((sum, review) => sum + review.reviewValue, 0) /
        totalReviews
      : 0;

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
              <Ratings rating={averageReviewsValue} readOnly={true}  />
            </div>
            <span className="text-sm sm:text-base text-muted-foreground">
              ({averageReviewsValue.toFixed(1)})
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
              {getProductReview?.length > 0 ? (
                getProductReview.map((reviewItem, index) => (
                  <div key={index} className="flex gap-4 p-4  border-b mb-2">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border">
                      <AvatarFallback>
                        {reviewItem?.userName?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {reviewItem?.userName}
                        </h3>
                        <div className="scale-[0.75] origin-right">
                          <Ratings
                            rating={reviewItem.reviewValue}
                            readOnly={true}
                          />
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No reviews yet for this product.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <Label className="text-sm sm:text-base">
              Give us your feedback
            </Label>
            <div className="flex">
              <Ratings
                rating={rating}
                handleRatingChange={handleRatingChange}
              />
            </div>
            <Input
              name="reviewMsg"
              value={reviewMsg}
              onChange={(event) => setReviewMsg(event.target.value)}
              placeholder="Leave a review..."
            />
            <Button
              disabled={reviewMsg.trim() === ""}
              onClick={handleAddReview}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;
