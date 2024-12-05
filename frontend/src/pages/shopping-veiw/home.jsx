import { Button } from '@/components/ui/button';
import images from '@/assets/assets';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { PiDressLight, PiTShirtLight, PiBabyLight } from 'react-icons/pi';
import { GiHeartNecklace, GiRunningShoe } from 'react-icons/gi';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFilteredProducts } from '@/store/shop/shopProductsSlice';
import ShopProductsDisplay from './shopProductsDisplay';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.shopProducts);
  const navigate = useNavigate()

  const slides = [
    {
      image: images.heroBg,
      text: 'Elevate Your Wardrobe with the Latest Trends',
      position: 'center',
    },
    {
      image: images.header_img,
      text: 'Step Out in Style: Uncover Your Next Favorite Pair',
      position: 'start',
    },
    {
      image: images.earing,
      text: 'Accessorize Your Journey: Shop Unique Finds',
      position: 'end',
    },
  ];

  const categories = [
    { id: 'men', label: 'Men', icon: PiTShirtLight },
    { id: 'women', label: 'Women', icon: PiDressLight },
    { id: 'kids', label: 'Kids', icon: PiBabyLight },
    { id: 'accessories', label: 'Accessories', icon: GiHeartNecklace },
    { id: 'footwear', label: 'Footwear', icon: GiRunningShoe },
  ];

  const brands = [
    { id: 'nike', label: 'Nike', logo: images.nikeLogo },
    { id: 'adidas', label: 'Adidas', logo: images.adidasLogo },
    { id: 'puma', label: 'Puma', logo: images.pumaLogo },
    { id: 'timberland', label: 'Timberland', logo: images.timberlandLogo },
    { id: 'vans', label: 'Vans', logo: images.vansLogo },
    { id: 'converse', label: 'Converse', logo: images.converseLogo },
    { id: 'new_balance', label: 'New Balance', logo: images.nbLogo },
    { id: 'formal', label: 'Formal', logo: images.clarksLogo },
  ];

function handleNavigationToListingPage(getCurrentItem, section){
  sessionStorage.removeItem('filters')
const currentFilter = { [section] : [getCurrentItem.id] }
sessionStorage.setItem('filters', JSON.stringify(currentFilter) )
navigate(`/listing`)
}


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
        sortParams: 'price-lowtohigh',
      })
    );
  }, [dispatch]);

  

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
            <div
              className={`absolute w-[30%] text-white text-lg font-bold bg-black/40 p-2 rounded-md ${
                slide.position === 'start'
                  ? 'top-1/2 left-[calc(8px+4%)] -translate-y-1/2'
                  : slide.position === 'center'
                  ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center'
                  : 'top-1/2 right-[calc(8px+4%)] -translate-y-1/2'
              }`}
            >
              {slide.text}
              <Button
                // variant="outline"
                className={`mt-4 ${
                  slide.position === 'start'
                    ? 'text-left'
                    : slide.position === 'center'
                    ? 'mx-auto'
                    : 'ml-auto'
                }`}
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
          <h2 className="font-bold text-2xl text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={()=>handleNavigationToListingPage(category, 'category')}
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
                onClick={()=>handleNavigationToListingPage(brand, 'brand')}

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


      {/* display products */}
      <section className="py-12  ">
      <div className="container mx-auto">
          <h2 className="font-bold text-2xl text-center mb-8"> Featured Products </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-8 gap-6">
{
  productList && productList.length > 0 ?
  productList.map((productItem) => ( <ShopProductsDisplay product={productItem} />)
     
  ) : null
}
          </div>
          </div>
      </section>
    </div>
  );
};

export default Home;
