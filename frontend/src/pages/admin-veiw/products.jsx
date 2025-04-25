import React, { Fragment, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Form from "@/components/common/Form";
import { addProductsFormElements } from "@/config/config";
import ProductImageUpload from "./productImageUpload";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchProducts,
} from "@/store/admin/ProductsSlice";
import { useToast } from "@/hooks/use-toast";
import AdminProductDisplay from "@/components/admin-veiw/productDisplay";
import { PlusCircle, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
};

const AdminProducts = () => {
  const [createProducts, setCreateProducts] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [editedId, setEditedId] = useState(null);
  const [showDeleteOverlay, setShowDeleteOverlay] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const { productList, loading } = useSelector((state) => state.adminProducts);
  const { toast } = useToast();

  const handleImageUploadSuccess = (imageUrl) => {
    setUploadedImageUrl(imageUrl);
    toast({
      title: "✅ Image Uploaded",
      description: "Product image successfully uploaded!",
      variant: "default",
    });
  };

  function isFormValid() {
    // Check all form fields are filled
    const formFieldsValid = Object.entries(formData).every(([key, value]) => {
      // Skip image validation for edits
      if (editedId && key === "image") return true;
      // For new products, all fields must be filled
      if (key === "salePrice") return true; // salePrice is optional
      return value !== "" && value !== null;
    });

    // Image is required only for new products
    const imageValid = editedId ? true : uploadedImageUrl !== "";

    return formFieldsValid && imageValid;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast({
        title: "⚠️ Incomplete Form",
        description: "Please fill all required fields and upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = editedId
        ? { ...formData }
        : { ...formData, image: uploadedImageUrl };

      const action = editedId
        ? editProduct({ id: editedId, formData: productData })
        : addNewProduct(productData);

      const result = await dispatch(action);

      if (result?.payload?.success) {
        await dispatch(fetchProducts());
        toast({
          title: editedId ? "✅ Product Updated" : "🛍️ Product Added",
          description: editedId
            ? "Changes have been successfully saved."
            : "A new product has been successfully added.",
        });
        resetForm();
      } else {
        throw new Error(result?.payload?.message || "Operation failed");
      }
    } catch (error) {
      toast({
        title: "❌ Operation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
    setEditedId(null);
    setCreateProducts(false);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const result = await dispatch(deleteProduct(productToDelete));

      if (result?.payload?.success) {
        await dispatch(fetchProducts());
        toast({
          title: "🗑️ Product Deleted",
          description: "The product was permanently removed.",
        });
      } else {
        throw new Error(result?.payload?.message || "Deletion failed");
      }
    } catch (error) {
      toast({
        title: "❌ Deletion Failed",
        description: error.message || "Could not delete product. Try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteOverlay(false);
      setProductToDelete(null);
    }
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setShowDeleteOverlay(true);
  };

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="flex w-full mb-6 justify-end">
        <Button onClick={() => setCreateProducts(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add new product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productList?.map((productItem) => (
            <AdminProductDisplay
              key={productItem._id}
              product={productItem}
              setEditedId={setEditedId}
              setCreateProducts={setCreateProducts}
              setFormData={setFormData}
              handleDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <Sheet open={createProducts} onOpenChange={setCreateProducts}>
        <SheetContent
          side="right"
          className="w-full sm:w-[600px] overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">
              {editedId ? "Edit Product" : "Create New Product"}
            </SheetTitle>
            <SheetDescription>
              {editedId
                ? "Update the product details below"
                : "Fill out the form to add a new product to your store"}
            </SheetDescription>
          </SheetHeader>

          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={handleImageUploadSuccess}
            setImageLoading={setImageLoading}
            imageLoading={imageLoading}
            isEditMode={editedId !== null}
            currentImage={editedId ? formData.image : null}
          />

          <Form
            onSubmit={onSubmit}
            formData={formData}
            setFormData={setFormData}
            formControls={addProductsFormElements}
            buttonText={editedId ? "Update Product" : "Add Product"}
            isBtnDisabled={!isFormValid() || imageLoading}
            isLoading={isSubmitting}
          />
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteOverlay} onOpenChange={setShowDeleteOverlay}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Delete Product?
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              This will permanently delete this product and all its data. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteOverlay(false)}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="px-8"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default AdminProducts;
