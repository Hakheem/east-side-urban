import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import ProductImageUpload from "./productImageUpload";
import { useDispatch, useSelector } from "react-redux";
import { addFeatureImages, fetchFeatureImages } from "@/store/common/featureSlice";
import { Loader2, Image, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const AdminDashboard = () => {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(false);

  const dispatch = useDispatch();
  const { featureImageList, isLoading } = useSelector((state) => state.commonFeatures);

  const handleUploadFeatureImage = () => {
    if (uploadedImageUrl) {
      dispatch(addFeatureImages({ image: uploadedImageUrl })).then((data) => {
        if (data?.payload?.message === "Feature image added successfully") {
          dispatch(fetchFeatureImages());
          setImageFile(null);
          setUploadedImageUrl("");
        }
      });
    }
  };

  useEffect(() => {
    dispatch(fetchFeatureImages());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6" />
            Feature Images Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
              className="w-full"
              disabled={isLoading || !uploadedImageUrl}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Image"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-6 w-6" />
            Current Feature Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featureImageList && featureImageList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {featureImageList.map((featureImgItem, index) => (
                <div key={index} className="relative group">
                  <img
                    src={featureImgItem.image}
                    alt={`Feature Image ${index}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mb-4" />
              <p>No feature images uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;