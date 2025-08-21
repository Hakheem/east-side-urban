import React, { useEffect, useState } from "react";
import Filter from "./filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { LuArrowUpDown } from "react-icons/lu";
import { sortOptions } from "@/config/config";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/shopProductsSlice";
import ShopProductDisplay from "./shopProductsDisplay";
import { useSearchParams } from "react-router-dom";
import ProductDetails from "./productDetails";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { useToast } from "@/hooks/use-toast"


const Listing = () => {
  const dispatch = useDispatch();
  const { productList, productDetails, error } = useSelector(
    (state) => state.shopProducts
  );
  const { user } = useSelector((state) => state.auth);
  const { cartItems, isLoading: cartLoading } = useSelector((state) => state.shopCart);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { toast } = useToast()
  const categorySearchParam = searchParams.get("category");

  const handleSort = (value) => {
    setSort(value);
  };

  // Handle filtering logic
  const handleFilter = (sectionId, currentOption) => {
    let filtersCopy = { ...filters };

    if (!filtersCopy[sectionId]) {
      filtersCopy[sectionId] = [currentOption];
    } else {
      const currentOptionIndex = filtersCopy[sectionId].indexOf(currentOption);

      if (currentOptionIndex === -1) {
        filtersCopy[sectionId] = [...filtersCopy[sectionId], currentOption];
      } else {
        filtersCopy[sectionId] = filtersCopy[sectionId].filter(
          (option) => option !== currentOption
        );
      } 
    } 

    setFilters(filtersCopy);
    sessionStorage.setItem("filters", JSON.stringify(filtersCopy));
  }; 

  // handleProductDetails function
  const handleProductDetails = (currentId) => {
    dispatch(fetchProductDetails(currentId))
      .then((action) => {
        if (action.type === "products/fetch-product-details/fulfilled") {
          console.log("Fetched Product Details:", action.payload);
        }
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  };

  // Handle add to cart functionality
  const handleAddToCart = async (currentId, getTotalStock) => {
    try {
      // Check stock for both guest and authenticated users
      const existingItem = cartItems.find(item => item.productId === currentId);
      if (existingItem && existingItem.quantity >= getTotalStock) {
        toast({
          title: "⚠️ Stock Limit",
          description: "Product quantity in cart exceeds available stock",
          variant: "default",
        });
        return;
      }

      const product = productList.find((p) => p._id === currentId);
      const result = await dispatch(addToCart({
        productId: currentId,
        quantity: 1
      })).unwrap();

      if (result.success) {
        toast({
          title: "🛒 Added to Cart",
          description: `${product?.title || "Product"} added to cart successfully!`,
          variant: "default",
        });
        dispatch(fetchCartItems()); // Refresh cart items
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  // Load initial filters and sort from session storage
  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);

  // Update searchParams when filters change
  useEffect(() => {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value) && value.length > 0) {
        query.append(key, value.join(","));
      }
    }

    setSearchParams(query);
  }, [filters, setSearchParams]);

  // Fetch products whenever filters or sort change
  useEffect(() => {
    dispatch(
      fetchFilteredProducts({ filterParams: filters, sortParams: sort })
    );
  }, [dispatch, filters, sort]);

  // Load cart on initial render
  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Show product details modal
  useEffect(() => {
    if (productDetails !== null) setShowProductDetails(true);
  }, [productDetails]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 p-4 md:p-6">
      <Filter filters={filters} handleFilter={handleFilter} />
      <div className="bg-background w-full rounded-lg shadow-sm">
        <div className="p-4 px-0 md:px-4 border-b flex gap-4 items-center justify-between">
          <h2 className="text-lg font-extrabold">All Products</h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {productList.length} Products
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center gap-1"
                  variant="outline"
                  size="sm"
                >
                  <LuArrowUpDown className="w-4 h-4" />
                  <span>Sort by</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[20px] mt-1">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      className="cursor-pointer"
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Product Grid */}
<div className="grid grid-cols-2 gap-4 md:p-4 sm:gap-2 md:grid-cols-2 lg:grid-cols-4">
  {error && <p className="text-red-500 col-span-full">Error: {error}</p>}
  {productList.length > 0 ? (
    productList.map((productItem, index) => (
      <ShopProductDisplay
        key={productItem._id || index}
        product={productItem}
        handleProductDetails={handleProductDetails}
        handleAddToCart={handleAddToCart}
      />
    ))
  ) : (
    <div className="col-span-full flex flex-col items-center justify-center py-12 space-y-4 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        No products found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        We couldn't find any products matching your criteria. Try adjusting your filters or check back later.
      </p>
    </div>
  )}
</div>
      </div>
      <ProductDetails
        open={showProductDetails}
        setOpen={setShowProductDetails}
        productDetails={productDetails}
      />
    </div>
  );
};

export default Listing;