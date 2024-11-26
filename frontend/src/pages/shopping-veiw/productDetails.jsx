import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IoMdStar, IoMdStarHalf } from "react-icons/io";

const ProductDetails = ({ open, setOpen, productDetails }) => {
  if (!productDetails) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 overflow-auto lg:h-[35rem] gap-6 p-4 sm:p-6 lg:gap-8 sm:max-w-[90vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="object-cover w-full aspect-square"
          />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            {productDetails?.title}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {productDetails?.description}
          </p>

          <div className="flex items-center justify-between">
            <p
              className={`text-xl sm:text-2xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 && (
              <p className="text-xl sm:text-2xl font-bold text-red-500">
                ${productDetails.salePrice}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 items-center mt-2">
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
              <IoMdStarHalf className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
            </div>
            <span className="text-sm sm:text-base text-muted-foreground">
              (4.5)
            </span>
          </div>

          <div className="mt-4">
            <Button className="w-full">Add to Cart</Button>
          </div>

          <hr className="mt-6 h-[2px]" />

          <div className="max-h-[200px] sm:max-h-[300px] overflow-auto">
            <h2 className="text-lg sm:text-xl font-bold capitalize mb-4">
              Reviews
            </h2>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border">
                  <AvatarFallback>HH</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h3 className="font-bold">Hakheem Hakheem</h3>
                  <div className="flex gap-0.5 items-center">
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStar className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                    <IoMdStarHalf className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    The shoe is awesome. Well stitched, unique and affordable
                    too.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Input placeholder="Leave a review..." />
            <Button>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;
