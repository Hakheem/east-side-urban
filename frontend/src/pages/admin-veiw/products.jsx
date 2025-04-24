import React, { Fragment, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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

  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);
  const { toast } = useToast();

  const onSubmit = (e) => {
    e.preventDefault();

    editedId !== null
      ? dispatch(editProduct({ id: editedId, formData })).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchProducts());
            setFormData(initialFormData);
            setCreateProducts(false);
            setEditedId(null);
            toast({
              title: "✅ Product Updated",
              description: "Changes have been successfully saved.",
            });
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchProducts());
            setImageFile(null);
            setFormData(initialFormData);
            setCreateProducts(false);
            toast({
              title: "🛍️ Product Added",
              description: "A new product has been successfully added.",
            });
          } else {
            toast({
              title: "❌ Failed to Add Product",
              description: "Something went wrong. Please try again.",
            });
          }
        });
  };

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  const confirmDelete = () => {
    if (!productToDelete) return;

    dispatch(deleteProduct(productToDelete)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchProducts());
        toast({
          title: "🗑️ Product Deleted",
          description: "The product was permanently removed.",
        });
      } else {
        toast({
          title: "❌ Deletion Failed",
          description: "Could not delete product. Try again.",
        });
      }
      setShowDeleteOverlay(false);
      setProductToDelete(null);
    });
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
        <Button onClick={() => setCreateProducts(true)}>Add new product</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductDisplay
                key={productItem.id}
                product={productItem}
                setEditedId={setEditedId}
                setCreateProducts={setCreateProducts}
                setFormData={setFormData}
                handleDelete={handleDeleteClick}
              />
            ))
          : null}
      </div>

      <Sheet
        open={createProducts}
        onOpenChange={(isOpen) => {
          setCreateProducts(isOpen);
          if (!isOpen) {
            setEditedId(null);
            setFormData(initialFormData);
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {editedId ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoading={setImageLoading}
            imageLoading={imageLoading}
            isEditMode={editedId !== null}
          />
          <div className="py-6">
            <Form
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              formControls={addProductsFormElements}
              buttonText={editedId ? "Update" : "Add"}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Overlay */}
      <Dialog open={showDeleteOverlay} onOpenChange={setShowDeleteOverlay}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              This will permanently delete the product. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteOverlay(false)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="px-6"
            >
              Delete Permanently
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default AdminProducts;
