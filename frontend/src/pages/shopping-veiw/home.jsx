import { Button } from "@/components/ui/button";
import images from "@/assets/assets";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { PiDressLight, PiTShirtLight, PiBabyLight } from "react-icons/pi";
import { GiHeartNecklace, GiRunningShoe } from "react-icons/gi";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/shopProductsSlice";
import ShopProductsDisplay from "./shopProductsDisplay";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { useToast } from "@/hooks/use-toast"
import ProductDetails from "./productDetails";
import { fetchFeatureImages } from "@/store/common/featureSlice";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { toast } = useToast()
  const { user } = useSelector((state) => state.auth);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { featureImageList } = useSelector((state) => state.commonFeatures);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);

  const categories = [
    { id: "men", label: "Men", icon: PiTShirtLight },
    { id: "women", label: "Women", icon: PiDressLight },
    { id: "kids", label: "Kids", icon: PiBabyLight },
    { id: "accessories", label: "Accessories", icon: GiHeartNecklace },
    { id: "footwear", label: "Footwear", icon: GiRunningShoe },
  ];

  const brands = [
    { id: "nike", label: "Nike", logo: images.nikeLogo },
    { id: "adidas", label: "Adidas", logo: images.adidasLogo },
    { id: "puma", label: "Puma", logo: images.pumaLogo },
    { id: "timberland", label: "Timberland", logo: images.timberlandLogo },
    { id: "vans", label: "Vans", logo: images.vansLogo },
    { id: "converse", label: "Converse", logo: images.converseLogo },
    { id: "new_balance", label: "New Balance", logo: images.nbLogo },
    { id: "formal", label: "Formal", logo: images.clarksLogo },
  ];

  const handleNavigationToListingPage = (item, section) => {
    sessionStorage.removeItem("filters");
    const currentFilter = { [section]: [item.id] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/listing`);
  };

  const handleProductDetails = (currentId) => {
    dispatch(fetchProductDetails(currentId));
  };

  const handleAddToCart = async (currentId) => {
    try {
      const product = productList.find((p) => p._id === currentId);
      
      // Check stock
      const existingItem = cartItems.find(item => item.productId === currentId);
      if (existingItem && existingItem.quantity >= product?.totalStock) {
        toast({
          title: "⚠️ Stock Limit",
          description: `Only ${product?.totalStock} ${product?.title} available in stock`,
          variant: "default",
        });
        return;
      }
  
      const result = await dispatch(addToCart({
        productId: currentId,
        quantity: 1
      })).unwrap();
  
      if (result.success) {
        toast({
          title: "🛒 Added to Cart",
          description: `${product?.title} added to cart!`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive",
      });
    } 
  };

  // Load initial data with optimizations
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load feature images first (they're likely smaller and faster)
      await dispatch(fetchFeatureImages());
      
      // Load cart items if user is logged in
      if (user) {
        dispatch(fetchCartItems());
      }
      
      // Load a limited number of featured products instead of all products
      await dispatch(
        fetchFilteredProducts({ 
          filterParams: { featured: true, limit: 8 }, 
          sortParams: "price-lowtohigh" 
        })
      );
      
      setHasInitialData(true);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % (featureImageList?.length || 1));
    }, 8000);

    return () => clearInterval(interval);
  }, [featureImageList?.length]);

  useEffect(() => {
    // Load initial data with a small delay to allow the UI to render first
    const timer = setTimeout(() => {
      loadInitialData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [loadInitialData]);

  useEffect(() => {
    if (productDetails) setShowProductDetails(true);
  }, [productDetails]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Slider Section */}
      <div className="relative w-[95%] h-[clamp(300px,10vw,500px)] md:h-[clamp(350px,15vw,400px)] lg:h-[500px] mx-auto mt-6 rounded-xl items-center overflow-hidden">
        {featureImageList?.length > 0 ? (
          featureImageList.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity rounded-lg ease-in duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute flex flex-col items-start gap-4 max-w-[50%] bottom-[10%] left-[5vw] animate-fadeIn">
                <h2 className="hidden md:block text-[clamp(22px,4.5vw,40px)] text-gray-800 font-semibold leading-tight">
                  From street to sleek{" "}
                  <span className="text-red-600 font-itim ">
                    style, Effortlessly
                  </span>
                </h2>
                <p className=" text-[clamp(14px,2vw,18px)] text-gray-800 font-medium">
                  Discover bold footwear, urban threads, and accessories for men,
                  women, and kids at{" "}
                  <span className="text-red-600 font-itim capitalize"> 
                    East Side Street Wear
                  </span>
                  . Whether you're chasing clean kicks or statement fits, we've
                  got your street style on lock. Shop now and rep the culture.
                </p>
                <Button
                  onClick={handleNavigationToListingPage}
                  className="border-none mt-1 text-white font-medium px-6 py-3 text-[clamp(13px,1vw,16px)] bg-red-500 rounded-full cursor-pointer transition duration-300 hover:bg-red-700"
                >
                  View Categories
                </Button>
              </div>
            </div>
          ))
        ) : (
          // Skeleton for hero section while loading
          <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>
        )}

        {/* Navigation buttons */}
        <Button
          onClick={() =>
            setCurrentSlide(
              (prev) =>
                (prev - 1 + (featureImageList?.length || 1)) % (featureImageList?.length || 1)
            )
          }
          variant="outline"
          size="icon"
          className="absolute hidden lg:flex top-1/2 left-4 transform -translate-y-1/2 opacity-15 hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>

        <Button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % (featureImageList?.length || 1))
          }
          variant="outline"
          size="icon"
          className="absolute hidden lg:flex top-1/2 right-4 transform -translate-y-1/2 opacity-15 hover:opacity-100 transition-opacity duration-300"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories Section */}
      <section className="py-8 md:py-10 lg:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-2xl text-center mb-8">
            Shop by Category
          </h2>

          {/* Large screens grid layout */}
          <div className="hidden lg:grid grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() =>
                  handleNavigationToListingPage(category, "category")
                }
                className="cursor-pointer hover:shadow-lg transition-shadow bg-white p-6 rounded-lg flex flex-col items-center"
              >
                <category.icon className="w-12 h-12 mb-4 text-primary" />
                <span className="font-bold">{category.label}</span>
              </div>
            ))}
          </div>

          {/* Mobile slider */}
          <div className="lg:hidden overflow-x-scroll flex gap-4 py-4 mx-1 md:mx-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() =>
                  handleNavigationToListingPage(category, "category")
                }
                className="cursor-pointer flex-shrink-0 bg-white p-6 rounded-lg flex flex-col items-center w-32 h-32 hover:shadow-lg transition-shadow"
              >
                <category.icon className="w-12 h-12 mb-4 text-primary" />
                <span className="font-bold">{category.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-8">
        <div className="container mx-auto">
          <h2 className="font-bold text-2xl text-center mb-8">Shop by Brand</h2>

          {/* Large screens grid layout */}
          <div className="hidden lg:grid grid-cols-8 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleNavigationToListingPage(brand, "brand")}
                className="cursor-pointer flex flex-col items-center "
              >
                <img
                  src={brand.logo}
                  alt={`${brand.label} Logo`}
                  className="w-20 h-20 rounded-full mb-3 object-contain hover:shadow-md transition-shadow duration-100 "
                  loading="lazy"
                />
                <span className="font-bold">{brand.label}</span>
              </div>
            ))}
          </div>

          {/* Mobile slider */}
          <div className="lg:hidden overflow-x-scroll flex gap-9 py-4 mx-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleNavigationToListingPage(brand, "brand")}
                className="cursor-pointer flex-shrink-0 flex flex-col items-center hover:shadow-lg transition-shadow"
              >
                <img
                  src={brand.logo}
                  alt={`${brand.label} Logo`}
                  className="w-20 h-20 rounded-full mb-3 object-contain"
                  loading="lazy"
                />
                <span className="font-bold">{brand.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="font-bold text-xl sm:text-2xl text-center mb-6 md:mb-8">
            Featured Products
          </h2>
          
          {isLoading ? (
            // Skeleton loader for products
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200 w-full"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded-md w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : productList && productList.length > 0 ? (
            // Actual products
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {productList.map((product) => (
                <ShopProductsDisplay
                  key={product.id}
                  handleProductDetails={handleProductDetails}
                  handleAddToCart={handleAddToCart}
                  product={product}
                />
              ))}
            </div>
          ) : (
            // No products message
            <div className="text-center py-8">
              <p className="text-gray-500">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      <ProductDetails
        open={showProductDetails}
        setOpen={setShowProductDetails}
        productDetails={productDetails}
      />
    </div>
  );
};

export default Home;
