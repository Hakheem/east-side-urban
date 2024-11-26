import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IoMdStar, IoMdStarHalf } from "react-icons/io";

const ProductDetails = ({ open, setOpen, productDetails }) => {
  if (!productDetails) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="grid grid-cols-2 gap-8 sm:p-12 max-w-[90vw] sm:max-w-[80vw] lg:max-w-[70vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            width={600}
            height={600}
            className="object-cover w-full aspect-square"
          />
        </div>
        <div className="gap-8">
          <h1 className="text-3xl font-extrabold mb-4">
            {productDetails?.title}
          </h1>
          <p className="text-muted-foreground text-xl mb-4 ">
            {productDetails?.description}
          </p>
          <div className="flex items-center justify-between ">
            <p
              className={`text-2xl font-bold text-primary ${
                productDetails?.salePrice > 0 ? "line-through" : ""
              }`}
            >
              ${productDetails?.price}
            </p>
            {productDetails?.salePrice > 0 ? (
              <p className="text-2xl font-bold text-red-500">
                ${productDetails.salePrice}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 ">
            <div className="flex gap-0.5 items-center mt-3 ">
              <IoMdStar className="w-5 h-5 fill-primary" />
              <IoMdStar className="w-5 h-5 fill-primary" />
              <IoMdStar className="w-5 h-5 fill-primary" />
              <IoMdStar className="w-5 h-5 fill-primary" />
              <IoMdStarHalf className="w-5 h-5 fill-primary" />
            </div>
            <span className="text-muted-foreground">(4.5)</span>
          </div>
          <div className="mt-4 ">
            <Button className="w-full">Add to Cart</Button>
          </div>
          <hr className="mt-6 h-[3px]" />
          <div className="max-h-[300px] overflow-auto ">
            <h2 className="text-xl capitalize font-bold mb-4 ">reviews</h2>
            <div className="grid gap-6 ">
              <div className="flex gap-4 ">
                <Avatar className="w-10 h-10 border ">
                  <AvatarFallback>HH</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="flex flex-col gap-2  ">
                    <h3 className="font-bold ">Hakheem Hakheem</h3>
                    <div className="flex gap-0.5 items-center ">
                      <IoMdStar className="w-5 h-5 fill-primary" />
                      <IoMdStar className="w-5 h-5 fill-primary" />
                      <IoMdStar className="w-5 h-5 fill-primary" />
                      <IoMdStar className="w-5 h-5 fill-primary" />
                      <IoMdStarHalf className="w-5 h-5 fill-primary" />
                    </div>
                    <p className="text-muted-foreground ">
                      The shoe is awesome. Well stitched, unique and affordable
                      too.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-2 ">
            <Input placeholder="Write a review..." />
            <Button className="">Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;
