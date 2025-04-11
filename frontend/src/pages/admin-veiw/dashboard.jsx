import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import ProductImageUpload from "./productImageUpload";
import { useDispatch, useSelector } from "react-redux";
import { addFeatureImages, fetchFeatureImages } from "@/store/common/featureSlice";

const AdminDashboard = () => {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const dispatch = useDispatch();
  const { featureImageList, isLoading } = useSelector((state) => state.commonFeatures);

  // Handle image upload
  const handleUploadFeatureImage = () => {
    console.log("Handle Upload Clicked");
    console.log("Uploaded Image URL:", uploadedImageUrl); 

    if (uploadedImageUrl) {
      console.log("Dispatching addFeatureImages with image:", uploadedImageUrl);
      dispatch(addFeatureImages({ image: uploadedImageUrl })).then((data) => {
        console.log("Add Feature Images Response:", data);
        if (data?.payload?.message === "Feature image added successfully") {
          console.log("Successfully added image. Fetching feature images.");
          dispatch(fetchFeatureImages());
          setImageFile(null);
          setUploadedImageUrl(""); // Reset after upload
        } else {
          console.error("Error adding image:", data?.payload?.message);
        }
      }).catch((error) => {
        console.error("Error dispatching addFeatureImages:", error);
      });
    } else {
      console.error("No image URL found to upload.");
    }
  };

  useEffect(() => {
    dispatch(fetchFeatureImages());
  }, [dispatch]);

  return (
    <div>
      <h1 className="u">Upload Feature Images</h1>

      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoading={setImageLoading}
        imageLoading={imageLoading}
        isCustomStyling={true}
      />
      
      <Button
        onClick={handleUploadFeatureImage}
        className="mt-5 w-full"
        disabled={isLoading || !uploadedImageUrl}
      >
        {isLoading ? "Uploading..." : "Upload"}
      </Button>

      <div className=" mt-5 grid grid-cols-2 gap-4">
        {featureImageList && featureImageList.length > 0 ? (
          featureImageList.map((featureImgItem, index) => (
            <div key={index} className="">
              <img
                src={featureImgItem.image} 
                alt={`Feature Image ${index}`}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          ))
        ) : (
          <p>No images available</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
