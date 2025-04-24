import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Check, X } from "lucide-react";

const AddressCard = ({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setSelectedAddress,
  selectedAddress,
  addresses = [],
}) => {
  const [isSelected, setIsSelected] = useState(
    addressInfo?.isSelected || false
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const MAX_ADDRESSES = 3;

  const handleSelectAddress = (address) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isSelected: addr._id === address._id,
    }));

    setSelectedAddress(address);
    toast({
      title: "Address Selected",
      description: "This address will be used for delivery",
      variant: "success",
    });
    setIsSelected(true);
  };

  const handleDelete = () => {
    if (addresses && addresses.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one address",
        variant: "destructive",
      });
      return;
    }

    handleDeleteAddress(addressInfo);
    setDeleteDialogOpen(false);
    toast({
      title: "Address Deleted",
      description: "The address has been removed from your account",
      variant: "success",
    });
  };

  const handleEdit = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      toast({
        title: "Maximum Addresses Reached",
        description: `You can only have ${MAX_ADDRESSES} addresses. Please delete one to add a new one.`,
        variant: "destructive",
      });
      return;
    }
    handleEditAddress(addressInfo);
  };

  return (
    <Card
      className={`shadow-md rounded-lg bg-white relative transition-all duration-200 ${
        isSelected ? "ring-2 ring-blue-200 bg-blue-50" : "hover:shadow-sm"
      }`}
    >
      {/* Select Button */}
      {setSelectedAddress && (
        <Button
          className={`absolute top-3 right-3 z-10 ${
            isSelected
              ? "bg-primary hover:bg-primary/90"
              : "bg-white hover:bg-gray-50"
          }`}
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectAddress(addressInfo);
          }}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Selected
            </>
          ) : (
            "Select"
          )}
        </Button>
      )}

      <CardContent className="grid p-6 gap-4">
        <div className="space-y-3">
          {addressInfo?.isDefault && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2">
              Default Address
            </span>
          )}

          <div className="space-y-1">
            <Label className="block font-semibold text-gray-700">Address</Label>
            <p className="text-gray-600">{addressInfo?.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="block font-semibold text-gray-700">City</Label>
              <p className="text-gray-600">{addressInfo?.city}</p>
            </div>
            <div className="space-y-1">
              <Label className="block font-semibold text-gray-700">
                Zip Code
              </Label>
              <p className="text-gray-600">{addressInfo?.zipcode}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="block font-semibold text-gray-700">Phone</Label>
            <p className="text-gray-600">{addressInfo?.phone}</p>
          </div>

          {addressInfo?.notes && (
            <div className="space-y-1">
              <Label className="block font-semibold text-gray-700">
                Delivery Notes
              </Label>
              <p className="text-gray-600">{addressInfo?.notes}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 border-t">
        {/* Edit Button */}
        <Button
          variant="outline"
          onClick={handleEdit}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>

        {/* Delete Button with Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this address?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2">
              <p className="font-medium">{addressInfo?.address}</p>
              <p className="text-sm text-gray-600">
                {addressInfo?.city}, {addressInfo?.zipcode}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {addressInfo?.phone}
              </p>
            </div>

            {/* Edit Link */}
            <div className="mb-4 text-center">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  handleEdit();
                }}
                className="text-primary hover:underline font-medium text-sm"
              >
                <Pencil className="h-4 w-4 inline mr-1" />
                Edit this address instead
              </button>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
