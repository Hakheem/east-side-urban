import React, { Fragment, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Form from "@/components/common/Form";
import { addProductsFormElements } from "@/config/config";
import ProductImageUpload from "./ProductImageUpload";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchProducts,
} from "@/store/admin/ProductsSlice";
import { toast } from "react-toastify";
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

  const dispatch = useDispatch();
  const { productList } = useSelector((state) => state.adminProducts);

  const onSubmit = (e) => {
    e.preventDefault();

    editedId !== null
      ? dispatch(editProduct({ id: editedId, formData })).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchProducts());
            setFormData(initialFormData);
            setCreateProducts(false);
            setEditedId(null);
            toast.success("Product updated");
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
            toast.success("Product added");
          } else {
            toast.error("Failed to add product");
          }
        });
  };

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data.payload.success) {
        dispatch(fetchProducts());
        toast.success("Product deleted");
      }
    });
  }

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="flex w-full mb-6 justify-end">
        <Button onClick={() => setCreateProducts(true)}>Add new product</Button>
      </div>

      {/* Products */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductDisplay
                key={productItem.id}
                product={productItem}
                setEditedId={setEditedId}
                setCreateProducts={setCreateProducts}
                setFormData={setFormData}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>

      {/* Add Product Form */}
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
    </Fragment>
  );
};

export default AdminProducts;
