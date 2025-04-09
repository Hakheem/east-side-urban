import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const AddressCard = ({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setSelectedAddress,
  selectedAddress,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleSelectAddress = (address) => {
    setSelectedAddress(address); 
    toast.success("Address selected successfully!");
    setIsSelected(true); 
  };

  return (
    <Card
      className={`shadow-lg border border-gray-300 rounded-lg bg-white relative ${isSelected ? 'bg-blue-100' : ''}`}
    >
      {/* Absolute Select Button */}
      {setSelectedAddress && (
        <Button
          className="absolute top-2 right-2 z-10"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAddress(addressInfo); 
          }}
        >
          Select
        </Button>
      )}

      <CardContent className="grid p-6 gap-4">
        <div className="space-y-2">
          <Label className="block font-bold text-md text-gray-700">
            Address:
            <span className="font-normal text-gray-600 text-sm ml-2">
              {addressInfo?.address}
            </span>
          </Label>
          <Label className="block font-bold text-md text-gray-700">
            City:
            <span className="font-normal text-gray-600 text-sm ml-2">
              {addressInfo?.city}
            </span>
          </Label>
          <Label className="block font-bold text-md text-gray-700">
            Zipcode:
            <span className="font-normal text-gray-600 text-sm ml-2">
              {addressInfo?.zipcode}
            </span>
          </Label>
          <Label className="block font-bold text-md text-gray-700">
            Phone:
            <span className="font-normal text-gray-600 text-sm ml-2">
              {addressInfo?.phone}
            </span>
          </Label>
          <Label className="block font-bold text-md text-gray-700">
            Notes:
            <span className="font-normal text-gray-600 text-sm ml-2">
              {addressInfo?.notes}
            </span>
          </Label>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-3">
        {/* Edit Button */}
        <Button onClick={() => handleEditAddress(addressInfo)}>Edit</Button>

        {/* Delete Button */}
        <Button
          variant="destructive"
          onClick={() => handleDeleteAddress(addressInfo)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
