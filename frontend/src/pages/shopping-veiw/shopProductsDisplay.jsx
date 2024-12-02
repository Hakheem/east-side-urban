import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const ShopProductsDisplay = ({ product, handleProductDetails, handleAddToCart }) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div onClick={() => handleProductDetails(product?._id)} className="cursor-pointer">
        <div className="relative">
          <img
            src={product?.image} 
            alt={product?.title}
            className="w-full h-[250px] object-cover rounded-t-lg "
          />
          {product?.salePrice > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Sale
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">
          {product?.title}
        </h2>
        <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
          <span className="capitalize">{product?.category}</span>
          <span className="capitalize">{product?.brand}</span>
        </div>
        <div className="flex justify-between gap-4 items-center mb-3">
          <span
            className={`${
              product?.salePrice > 0
                ? "line-through text-gray-500"
                : "text-primary"
            } text-lg font-semibold`}
          >
            ${product?.price}
          </span>
          {product?.salePrice > 0 && (
            <span className="text-lg font-semibold text-red-600">
              ${product?.salePrice}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={()=> handleAddToCart(product?._id)} className="w-full">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};

export default ShopProductsDisplay;
