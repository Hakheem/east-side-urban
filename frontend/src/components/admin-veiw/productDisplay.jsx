import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

const AdminProductDisplay = ({
  product,
  setFormData,
  setCreateProducts,
  setEditedId,
  handleDelete
}) => {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <div className="div">
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg"
          />
        </div>
        <CardContent>
          <h2 className="mb-2 text-xl font-bold mt-2 ">{product?.title}</h2>
          <div className="flex items-center justify-between mb-2">
            <p
              className={`${
                product?.salePrice > 0 ? "line-through" : ""
              } text-lg font-semibold text-primary`}
            >
              ${product?.price}
            </p>

            {product?.salePrice > 0 && (
              <p className="text-lg font-bold">${product?.salePrice}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            onClick={() => {
              setCreateProducts(true);
              setEditedId(product?._id);
              setFormData(product);
            }}
            className=""
          >
            Edit
          </Button>
          <Button onClick={()=>handleDelete(product?._id)} className=""  variant="destructive">
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default AdminProductDisplay;
