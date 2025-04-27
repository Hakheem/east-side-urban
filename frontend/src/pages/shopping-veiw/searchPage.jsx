import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ShopProductsDisplay from "./shopProductsDisplay";
import {
  fetchSearchResults,
  clearSearchResults,
} from "../../store/shop/searchSlice";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { useToast } from "@/hooks/use-toast";
import ProductDetails from "./productDetails";
import { fetchProductDetails } from "@/store/shop/shopProductsSlice";
import { Search, Loader2, Sparkles } from "lucide-react";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading } = useSelector((state) => state.shopSearch);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
    const { toast } = useToast();
  

  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 2) {
        setSearchParams({ q: searchTerm });
        dispatch(fetchSearchResults(searchTerm));
      } else {
        dispatch(clearSearchResults());
        setSearchParams({});
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, setSearchParams]);

  const handleAddToCart = async (currentId, getTotalStock) => {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === currentId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity >= getTotalStock) {
          toast({
            title: "🛒 Stock Limit Reached",
            description: "You've already added the maximum available quantity to your cart",
            variant: "info"
          });
          return;
        }
      }
    }

    if (!user?.id) {
      toast({
        title: "🔒 Login Required",
        description: "Please sign in to add items to your cart",
        variant: "destructive"
      });
      return;
    }

    const product = productList.find((p) => p.id === currentId);

    try {
      const result = await dispatch(
        addToCart({
          userId: user.id,
          productId: currentId,
          quantity: 1,
        })
      );

      if (result?.payload?.success) {
        await dispatch(fetchCartItems(user.id));
        toast({
          title: "🎉 Added to Cart!",
          description: `${product?.title || "Item"} was successfully added to your cart`,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
      console.error("Error adding to cart:", error);
    }
  };

  const handleProductDetails = async (currentId) => {
    try {
      const action = await dispatch(fetchProductDetails(currentId));
      if (action.type.endsWith("/fulfilled")) {
        setShowProductDetails(true);
      }
    } catch (error) {
      toast({
        title: "⚠️ Error",
        description: "Couldn't load product details",
        variant: "destructive"
      });
      console.error("Error fetching product details:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Search Bar */}
      <div className="mb-8 max-w-4xl mx-auto relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="Search for products, brands, categories..."
          />
          {!searchTerm && (
            <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-pulse" />
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Searching our shelves...</p>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products?.length > 0 ? (
          products.map((product) => (
            <ShopProductsDisplay
              key={product._id}
              product={product}
              handleProductDetails={handleProductDetails}
              handleAddToCart={handleAddToCart}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 space-y-2">
            {searchTerm.trim().length > 2 ? (
              <>
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-muted-foreground">
                  Try different keywords like "blazer" or "adidas"
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center bg-primary/10 p-4 h-20 w-20 rounded-full mb-3">
                  <Search className="h-8 w-8 text-primary" />
                  <Sparkles className="h-5 w-5 text-yellow-500 -ml-2" />
                </div>
                <h3 className="text-lg font-medium">Discover Amazing Products</h3>
                <p className="text-muted-foreground">
                  Type atleast 3 characters to search
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <ProductDetails
        open={showProductDetails}
        setOpen={setShowProductDetails}
        productDetails={productDetails}
      />
    </div>
  );
};

export default SearchPage;