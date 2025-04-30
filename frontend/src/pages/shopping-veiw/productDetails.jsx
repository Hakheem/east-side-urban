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
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";

const ProductDetails = ({ open, setOpen, productDetails }) => {
  if (!productDetails) return null; 

  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0); 
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems, isLoading: cartLoading } = useSelector(
    (state) => state.shopCart
  );
  const { reviews: getProductReview } = useSelector(
    (state) => state.shopReviews
  );

  const handleAddToCart = async (currentId, getTotalStock) => {
    try {
      const existingItem = cartItems.find(
        (item) => item.productId === currentId
      );
      const currentQuantity = existingItem?.quantity || 0;
      const totalRequested = currentQuantity + quantity;

      if (totalRequested > getTotalStock) {
        toast({
          title: "⚠️ Stock Limit",
          description: `You can't add more than ${getTotalStock} items`,
          variant: "default",
        });
        return;
      }

      const result = await dispatch(
        addToCart({
          productId: currentId,
          quantity: quantity,
          auth: { isAuthenticated, userId: user?.id },
          details: {
            title: productDetails.title,
            price: productDetails.price,
            salePrice: productDetails.salePrice,
            image: productDetails.image,
            stock: productDetails.totalStock
          }
        })
      );

      // Refresh cart after adding if logged in
      if (isAuthenticated) {
        await dispatch(fetchCartItems());
      }

      if (addToCart.fulfilled.match(result)) {
        toast({
          title: "🛒 Added to Cart",
          description: `${quantity} ${quantity > 1 ? "items" : "item"} added!`,
          variant: "default",
        });
        setQuantity(1);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    dispatch(setProductDetails());
  };

  const handleRatingChange = (getRating) => {
    setRating(getRating);
  };

  const handleAddReview = async () => {
    if (!user?.id) {
      toast({
        title: "🔒 Login Required",
        description: "Please login to add a review",
        variant: "default",
      });
      return;
    }

    try {
      const response = await dispatch(
        addNewReview({
          productId: productDetails._id,
          reviewMessage: reviewMsg,
          reviewValue: rating,
          userId: user.id,
          userName: user.userName,
        })
      ).unwrap();

      if (response.success) {
        dispatch(getReviews(productDetails._id));
        toast({
          title: "🌟 Review Added",
          description: "Thank you for your feedback!",
          variant: "default",
        });
        setReviewMsg("");
        setRating(0);
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
      dispatch(fetchCartItems());
    }
  }, [productDetails, dispatch]);

  const totalReviews = getProductReview.length;
  const averageReviewsValue =
    totalReviews > 0
      ? getProductReview.reduce((sum, review) => sum + review.reviewValue, 0) /
        totalReviews
      : 0;

  const isInCart = cartItems.some(
    (item) => item.productId === productDetails?._id
  );
  const cartQuantity = cartItems.find(item => item.productId === productDetails?._id)?.quantity || 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 overflow-auto max-h-[90vh] lg:max-h-[80vh] gap-4 p-4 sm:p-6 lg:gap-6 w-full max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw]">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            className="object-contain w-full h-auto max-h-[400px] md:max-h-[500px] lg:max-h-none lg:h-[500px]"
          />
        </div>

        {/* Details Section */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {productDetails?.title}
          </h1>

          {/* Price */}
          <div className="flex items-center gap-3">
            {productDetails?.salePrice > 0 ? (
              <>
                <p className="text-xl font-bold text-red-500">
                  Ksh{productDetails.salePrice}
                </p>
                <p className="text-xl font-bold line-through text-gray-500 dark:text-gray-400">
                  Ksh{productDetails?.price}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-primary">
                Ksh{productDetails?.price}
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-muted-foreground">
            {productDetails?.description}
          </p>

          {/* Stock Status */}
          <div className="text-sm md:text-base">
            {productDetails?.totalStock > 0 ? (
              <span className="text-green-600 dark:text-green-400">
                In Stock ({productDetails.totalStock} available)
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400">
                Out of Stock
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Ratings rating={averageReviewsValue} readOnly={true} />
            <span className="text-sm text-muted-foreground">
              ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
            </span>
          </div>

          {/* Quantity Selector and Add to Cart Button */}
          <div className="mt-2 space-y-3">
            {productDetails?.totalStock > 0 && (
              <div className="flex items-center gap-4">
                <Label htmlFor="quantity">Quantity:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-10 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuantity((prev) =>
                        Math.min(productDetails.totalStock, prev + 1)
                      )
                    }
                    disabled={quantity >= productDetails.totalStock}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}

            {productDetails?.totalStock === 0 ? (
              <Button disabled className="w-full" size="lg">
                Out of stock
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
                disabled={cartLoading}
              >
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  <span>
                    {isInCart ? `Added (${cartQuantity})` : quantity > 1 ? `Add ${quantity} to Cart` : "Add to Cart"}
                  </span>
                </span>
              </Button>
            )}
          </div>

          <hr className="my-4 border-gray-200 dark:border-gray-700" />

          {/* Reviews Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Customer Reviews</h2>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
              {getProductReview?.length > 0 ? (
                getProductReview.map((reviewItem, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <Avatar className="w-10 h-10 border">
                      <AvatarFallback className="bg-primary text-white">
                        {reviewItem?.userName?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="font-medium">{reviewItem?.userName}</h3>
                        <div className="scale-90 sm:scale-100 origin-left">
                          <Ratings
                            rating={reviewItem.reviewValue}
                            readOnly={true}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {reviewItem.reviewMessage}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add Review Section */}
          {user && (
            <div className="mt-4 space-y-3">
              <h3 className="font-medium">Write a Review</h3>
              <div className="space-y-2">
                <div className="flex">
                  <Ratings
                    rating={rating}
                    handleRatingChange={handleRatingChange}
                  />
                </div>
                <Input
                  name="reviewMsg"
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="min-h-[100px]"
                  multiline
                />
                <Button
                  className="w-full sm:w-auto" 
                  disabled={reviewMsg.trim() === "" || rating === 0}
                  onClick={handleAddReview}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;