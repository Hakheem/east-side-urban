import React, { useEffect, useRef } from "react";
import { FiUpload } from "react-icons/fi";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

const ProductImageUpload = ({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoading,
  imageLoading,
}) => {
  const inputRef = useRef(null);

  // Handle image selection or drag-drop
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Drag over event
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Image drop event
  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle remove image action
  function handleRemoveImage(e) {
    e.stopPropagation();
    setImageFile(null);
    setUploadedImageUrl("");
  }

  // Upload image to cloud
  async function uploadedImageToCloud() {
    try {
      setImageLoading(true);

      const data = new FormData();
      data.append("image", imageFile);

      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );

      console.log("Response:", response);

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.imageURL);
      } else {
        alert("Image upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload the image. Please try again.");
    } finally {
      setImageLoading(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) uploadedImageToCloud();
  }, [imageFile]);

  return (
    <div className="w-full mx-auto max-w-md">
      <Label className="text-lg font-semibold mb-2 block">Upload image</Label>

      {/* File upload area */}
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed p-2 cursor-pointer h-44 w-full relative"
        onClick={() => inputRef.current.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {imageLoading ? (
          <Skeleton className="h-full w-full bg-gray-100 rounded-md" />
        ) : uploadedImageUrl ? (
          <div className="grid grid-cols-4 gap-2 w-full h-44">
            <div className="col-span-2 h-full">
              <img
                src={uploadedImageUrl}
                alt="Uploaded Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="col-span-1.5 flex flex-col justify-center text-sm font-medium text-ellipsis overflow-hidden break-words">
              {imageFile?.name}
            </div>

            <div className="col-span-0.5 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveImage}
                className="text-muted-foreground hover:text-foreground "
              >
                <MdDeleteForever className="w-8 h-8" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <FiUpload className="text-3xl mb-2" />
            <p className="text-sm text-gray-500">
              Drag and drop or click to upload image
            </p>
          </>
        )}

        {/* Invisible file input */}
        <input
          type="file"
          ref={inputRef}
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ProductImageUpload;
