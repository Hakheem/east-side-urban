import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useCallback, memo, useState } from "react";

const ShopProductsDisplay = memo(({ product, handleProductDetails }) => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.shopCart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Memoized cart item check
  const isInCart = cartItems.some((item) => item.productId === product?._id);
  const cartQuantity =
    cartItems.find((item) => item.productId === product?._id)?.quantity || 0;

  // Refresh cart items only when needed
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartItems());
    }
  }, [isAuthenticated, dispatch]);

  const handleAddToCart = useCallback(
    async (productId, totalStock) => {
      setIsAdding(true);

      try {
        // Check if product already in cart
        const existingItem = cartItems.find(
          (item) => item.productId === productId
        );
        const currentQuantity = existingItem?.quantity || 0;

        if (currentQuantity >= totalStock) {
          toast({
            title: "⚠️ Stock Limit Reached",
            description: `You already have ${currentQuantity} in cart (max ${totalStock})`,
            variant: "default",
          });
          setIsAdding(false);
          return;
        }

        // Add to cart
        const result = await dispatch(
          addToCart({
            productId,
            quantity: 1,
            auth: { isAuthenticated, userId: user?.id },
            details: {
              title: product.title,
              price: product.price,
              salePrice: product.salePrice,
              image: product.image,
              stock: product.totalStock,
            },
          })
        );

        toast({
          title: "🛒 Added to Cart",
          description: `${product.title} added to cart!`,
          variant: "success",
        });

        // For logged-in users, refresh cart in background after adding
        if (isAuthenticated) {
          setTimeout(() => {
            dispatch(fetchCartItems());
          }, 500);
        }
      } catch (error) {
        toast({
          title: "❌ Error",
          description: error.message || "Failed to add to cart",
          variant: "destructive",
        });
      } finally {
        setIsAdding(false);
      }
    },
    [cartItems, isAuthenticated, user, product, dispatch, toast]
  );

  // Don't render if product is undefined
  if (!product) return null;

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-md transition-shadow">
      <div
        onClick={() => handleProductDetails(product._id)}
        className="cursor-pointer"
      >
        <div className="relative">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[180px] sm:h-[200px] md:h-[250px] object-cover rounded-t-lg"
            loading="lazy"
          />
          {product.totalStock === 0 ? (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out of stock
            </Badge>
          ) : product.totalStock < 5 ? (
            <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
              {`Only ${product.totalStock} left`}
            </Badge>
          ) : (
            product.salePrice > 0 && (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                Sale
              </Badge>
            )
          )}
        </div>
      </div>

      <CardContent className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 line-clamp-2 text-gray-800">
          {product.title}
        </h2>
        <div className="flex justify-between items-center sm:mb-2 mb-1 text-xs sm:text-sm text-muted-foreground">
          <span className="capitalize line-clamp-1">{product.brand}</span>
          <span className="capitalize line-clamp-1">{product.category}</span>
        </div>
        <div className="flex justify-between gap-2 sm:gap-4 items-center mb-0 ">
          <span
            className={`${
              product.salePrice > 0
                ? "line-through text-gray-500"
                : "text-primary"
            } text-sm sm:text-base md:text-lg  font-semibold`}
          >
            Ksh.{product.price}
          </span>
          {product.salePrice > 0 && (
            <span className="text-sm sm:text-base md:text-lg font-semibold text-red-600">
              Ksh.{product.salePrice}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4">
        {product.totalStock === 0 ? (
          <Button disabled className="w-full text-xs sm:text-sm">
            Out of stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddToCart(product._id, product.totalStock)}
            className="w-full text-xs sm:text-sm"
            disabled={isAdding}
          >
            {isAdding
              ? "Adding..."
              : isInCart
              ? `Added (${cartQuantity})`
              : "Add to Cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

ShopProductsDisplay.displayName = "ShopProductsDisplay";

export default ShopProductsDisplay;
