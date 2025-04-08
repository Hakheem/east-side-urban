import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ShopProductsDisplay from "./shopProductsDisplay";
import {
  fetchSearchResults,
  clearSearchResults,
} from "../../store/shop/searchSlice";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { toast } from "react-toastify";
import ProductDetails from "./productDetails";
import { fetchProductDetails } from "@/store/shop/shopProductsSlice";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading } = useSelector((state) => state.shopSearch);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { productList, productDetails, error } = useSelector(
    (state) => state.shopProducts
  );

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
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, setSearchParams]);

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

    const product = productList.find((p) => p.id === currentId);

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
          toast.success(`${product?.title || "Product"} added to cart`, {
            position: "top-center",
          });
        }
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
      });
  };

  // product details
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

  useEffect(() => {
    if (productDetails !== null) setShowProductDetails(true);
  }, [productDetails]);

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-full flex items-center">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-xl py-4 px-4 w-full"
            placeholder="Search products..."
          />
        </div>
      </div>

      {isLoading && <p className="text-center">Searching...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
          <div className="col-span-full text-center py-12">
            {searchTerm.trim().length > 2
              ? "No products found. Try a different keyword."
              : "Type at least 3 characters to search."}
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
