// SearchPage.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ShopProductsDisplay from "./shopProductsDisplay";
import {
  fetchSearchResults,
  clearSearchResults,
} from "../../store/shop/searchSlice";

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, error } = useSelector(
    (state) => state.shopSearch
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
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products?.length > 0 ? (
          products.map((product) => (
            <ShopProductsDisplay key={product._id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            {searchTerm.trim().length > 2
              ? "No products found"
              : "Type at least 3 characters to search"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
