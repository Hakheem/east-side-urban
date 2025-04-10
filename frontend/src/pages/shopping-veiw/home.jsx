import { Button } from "@/components/ui/button";
import images from "@/assets/assets";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { PiDressLight, PiTShirtLight, PiBabyLight } from "react-icons/pi";
import { GiHeartNecklace, GiRunningShoe } from "react-icons/gi";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/shopProductsSlice";
import ShopProductsDisplay from "./shopProductsDisplay";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cartSlice";
import { toast } from "react-toastify";
import ProductDetails from "./productDetails";
import { fetchFeatureImages } from "@/store/common/featureSlice";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { user } = useSelector((state) => state.auth);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const { featureImageList } = useSelector((state) => state.commonFeatures);

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

  const handleAddToCart = (currentId) => {
    if (!user?.id) return;

    dispatch(addToCart({ userId: user.id, productId: currentId, quantity: 1 }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user.id));
          toast.success("Product added to cart", { position: "top-center" });
        }
      })
      .catch((error) => console.error("Error adding to cart:", error));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureImageList.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [featureImageList.length]);

  useEffect(() => {
    dispatch(
      fetchFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" })
    );
    dispatch(fetchFeatureImages());
  }, [dispatch]);

  useEffect(() => {
    if (productDetails) setShowProductDetails(true);
  }, [productDetails]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative w-full h-[600px] items-center fadeIn overflow-hidden">
        {featureImageList?.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity ease-in duration-2000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black bg-opacity-15"></div>
            <div className="absolute top-[calc(50%-3rem)] right-[calc(8px+4%)] transform -translate-y-1/2 text-white font-bold p-2 leading-snug text-[1.6rem] sm:text-[1.8rem] md:text-[2rem] lg:text-[2.3rem] w-[90%] sm:w-[80%] md:w-[70%] lg:w-[45%] text-center lg:text-left px-4 sm:px-6 md:px-8">
              {slide.text}
            </div>
            <div className="absolute top-[83%] left-1/2 transform -translate-x-1/2 w-1/2 md:w-[50%]">
              <Button
                className="w-full font-semibold h-12"
                onClick={handleNavigationToListingPage}
              >
                Shop Now
              </Button>
            </div>
          </div>
        ))}
        <Button
          onClick={() =>
            setCurrentSlide(
              (prev) =>
                (prev - 1 + featureImageList.length) % featureImageList.length
            )
          }
          variant="outline"
          size="icon"
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          onClick={() =>
            setCurrentSlide((prev) => (prev + 1) % featureImageList.length)
          }
          variant="outline"
          size="icon"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-2xl text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="font-bold text-2xl text-center mb-8">Shop by Brand</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleNavigationToListingPage(brand, "brand")}
                className="cursor-pointer flex flex-col items-center"
              >
                <img
                  src={brand.logo}
                  alt={`${brand.label} Logo`}
                  className="w-20 h-20 rounded-full mb-3 object-contain hover:shadow-lg transition-shadow"
                />
                <span className="font-bold">{brand.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="font-bold text-2xl text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-8 gap-6">
            {productList?.map((product) => (
              <ShopProductsDisplay
                key={product.id}
                handleProductDetails={handleProductDetails}
                handleAddToCart={handleAddToCart}
                product={product}
              />
            ))}
          </div>
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
