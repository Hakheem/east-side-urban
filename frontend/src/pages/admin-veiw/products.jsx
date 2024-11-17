import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Form from '@/components/common/Form';
import { addProductsFormElements } from '@/config/config';
import ProductImageUpload from './ProductImageUpload'; 
import { useDispatch, useSelector } from 'react-redux';
import { addNewProduct, fetchProducts } from '@/store/admin/productsSlice/ProductsSlice';
import { toast } from "react-toastify";



const initialFormData = {
  image: null,
  title: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  salePrice: '',
  totalStock: '',
};

const AdminProducts = () => {
  const [createProducts, setCreateProducts] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false)
  const dispatch = useDispatch();
  const {productList} = useSelector(state=>state.adminProducts)

  function onSubmit(e) {
    e.preventDefault();
    
    dispatch(addNewProduct({
      ...formData,
      image: uploadedImageUrl,
    })).then((data) => {
      console.log(data);
  
      if (data?.payload?.success) {
        dispatch(fetchProducts());
        setImageFile(null);
        setFormData(initialFormData);
        setCreateProducts(false);
        toast.success("Product added successfully");
      } else {
        toast.error("Failed to add product");
      }
    });
  
    console.log('Form submitted', formData);
  }
  
  

  useEffect(()=>{
dispatch(fetchProducts())
  },[dispatch])

  console.log(productList, 'productList');
  


  return (
    <Fragment>
      <div className="flex w-full mb-6 justify-end">
        <Button onClick={() => setCreateProducts(true)}>Add new product</Button>
      </div>

      {/* Products */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Sheet
          open={createProducts}
          onOpenChange={(isOpen) => setCreateProducts(isOpen)}
        >
          <SheetContent side="right" className="overflow-auto">
            <SheetHeader>
              <SheetTitle>Add new product</SheetTitle>
            </SheetHeader>
            <ProductImageUpload 
              imageFile={imageFile} 
              setImageFile={setImageFile} 
              uploadedImageUrl={uploadedImageUrl}
              setUploadedImageUrl={setUploadedImageUrl}
              setImageLoading = {setImageLoading}
              imageLoading={imageLoading}
            />
            <div className="py-6">
              <Form
                onSubmit={onSubmit}
                formData={formData}
                setFormData={setFormData}
                formControls={addProductsFormElements}
                buttonText="Add"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Fragment>
  );
};

export default AdminProducts;
