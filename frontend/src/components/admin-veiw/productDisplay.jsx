import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Edit2, Trash2, Percent, Box, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

const AdminProductDisplay = ({
  product,
  setFormData,
  setCreateProducts,
  setEditedId,
  handleDelete,
}) => { 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
        <div className="relative group">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-60 object-cover transition-opacity duration-300 group-hover:opacity-90"
          />
          {product?.salePrice > 0 && (
            <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
              <Percent className="h-3 w-3 mr-1" />
              SALE
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-lg line-clamp-1">
            {product?.title}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Box className="h-4 w-4" />
            <span>Stock: {product?.totalStock}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="h-4 w-4" />
            <span>Category: {product?.category}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-end gap-2">
              {product?.salePrice > 0 ? (
                <>
                  <span className="text-lg font-bold text-green-600">
                    Ksh.{product.salePrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    Ksh.{product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-primary">
                  Ksh.{product.price}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between gap-2 p-4 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1"
            onClick={() => {
              setCreateProducts(true);
              setEditedId(product?._id);
              setFormData(product);
            }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex-1 gap-1"
            onClick={() => handleDelete(product?._id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AdminProductDisplay;
