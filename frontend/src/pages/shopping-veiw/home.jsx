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

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { user } = useSelector((state) => state.auth);
  const [showProductDetails, setShowProductDetails] = useState(false);

  const slides = [
    {
      image: images.hero12,
      text: "Empower your look with our stylish women's collection. Fashion-forward designs for every occasion.",
    },
    {
      image: images.men1,
      text: "Elevate your style with our men's collection. Bold designs, quality fabrics, and the perfect fit.",
    },
    {
      image: images.hero2,
      text: "Unleash your style with our chic women’s collection. Effortless elegance, everyday comfort.",
    },
  ];

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

  function handleNavigationToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = { [section]: [getCurrentItem.id] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/listing`);
  }

  const handleProductDetails = (currentId) => {
    dispatch(fetchProductDetails(currentId));
  };

  const handleAddToCart = (currentId) => {
    if (!user?.id) return;

    dispatch(
      addToCart({
        userId: user.id,
        productId: currentId,
        quantity: 1,
      })
    )
      .then((data) => {
        if (data?.payload?.success) {
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(
      fetchFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (productDetails !== null) setShowProductDetails(true);
  }, [productDetails]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[600px] fadeIn overflow-hidden">
        {slides.map((slide, index) => (
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
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-15"></div>

            {/* Text container */}
            <div
              className={`
          heroTxt absolute top-[calc(50%-3rem)] right-[calc(8px+4%)] transform -translate-y-1/2 
          text-white font-bold p-2 leading-snug
          text-[1.6rem] sm:text-[1.8rem] md:text-[2rem] lg:text-[2.3rem]
          w-[90%] sm:w-[80%] md:w-[70%] lg:w-[45%]
          text-center lg:text-left px-4 sm:px-6 md:px-8
        `}
            >
              {slide.text}
            </div>

            {/* Button container */}
            <div className="absolute top-2/3 lg:bottom-[10rem] lg:left-[68%] md:left-[60%] left-1/2 transform -translate-x-1/2 w-[60%] md:w-[30%]">
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
              (prevSlide) => (prevSlide - 1 + slides.length) % slides.length
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
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length)
          }
          variant="outline"
          size="icon"
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Categories Section */}
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

      {/* Brands Section */}
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

      {/* Products Display Section */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="font-bold text-2xl text-center mb-8">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-8 gap-6">
            {productList && productList.length > 0
              ? productList.map((productItem) => (
                  <ShopProductsDisplay
                    handleProductDetails={handleProductDetails}
                    handleAddToCart={handleAddToCart}
                    product={productItem}
                  />
                ))
              : null}
          </div>
        </div>
      </section>

      {/* Product Details Modal */}
      <ProductDetails
        open={showProductDetails}
        setOpen={setShowProductDetails}
        productDetails={productDetails}
      />
    </div>
  );
};

export default Home;
