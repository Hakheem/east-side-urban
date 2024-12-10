import Form from "@/components/common/Form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addressFormControls } from "@/config/config";
import {
  addNewAddress,
  deleteAddress,
  fetchAddresses,
  editAddress,
} from "@/store/shop/addressSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddressCard from "./addressCard";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

const initialAddressFormData = {
  address: "",
  city: "",
  zipcode: "",
  phone: "",
  notes: "",
};

const Address = () => {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [showForm, setShowForm] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.addresses);

  // Handle add or update address action
  function manageAddress(e) {
    e.preventDefault();

    if (currentEditedId !== null) {
      dispatch(
        editAddress({
          userId: user?.id,
          addressId: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAddresses(user?.id));
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
          setShowForm(false);
          toast.success("Address updated successfully");
        } else {
          toast.error("Failed to update address");
        }
      });
    } else {
      if (addresses.length >= 3) {
        toast.error("You cannot add more than 3 addresses.");
        return;
      }

      // Add new address
      dispatch(
        addNewAddress({
          ...formData,
          userId: user?.id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAddresses(user?.id));
          setFormData(initialAddressFormData);
          setShowForm(false);
          toast.success("Address added successfully");
        } else {
          toast.error("Failed to add address");
        }
      });
    }
  }

  // Validate form data
  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  function handleDeleteAddress(addressInfo) {
    if (!addressInfo?._id) {
      return;
    }

    dispatch(
      deleteAddress({ userId: user?.id, addressId: addressInfo?._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAddresses(user?.id));
        toast.success("Address deleted successfully");
      } else {
        toast.error("Failed to delete address");
      }
    });
  }

  function handleEditAddress(getCurrentAddress) {
    setCurrentEditedId(getCurrentAddress?._id);
    setFormData({
      address: getCurrentAddress?.address || "",
      city: getCurrentAddress?.city || "",
      zipcode: getCurrentAddress?.zipcode || "",
      phone: getCurrentAddress?.phone || "",
      notes: getCurrentAddress?.notes || "",
    });
    setShowForm(true);
  }

  useEffect(() => {
    dispatch(fetchAddresses(user?.id));
  }, [dispatch, user?.id]);

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-2 sm:grid-cols-2  gap-2">
        {addresses && addresses.length > 0 ? (
          addresses.map((singleAddress) => (
            <AddressCard
              key={singleAddress?._id}
              addressInfo={singleAddress}
              handleDeleteAddress={handleDeleteAddress}
              handleEditAddress={handleEditAddress}
            />
          ))
        ) : (
          <p className="text-md font-medium mx-4">
            You haven't added an address.
          </p>
        )}
      </div>

      {addresses.length > 0 && !showForm && (
        <div className="flex justify-center my-4">
          <Button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(true);
              setFormData(initialAddressFormData);
              setCurrentEditedId(null);
            }}
          >
            Add new address
          </Button>
        </div>
      )}

      {/* Address Form */}
      {(addresses.length === 0 || showForm) && (
        <>
          <CardHeader>
            <CardTitle>
              {currentEditedId ? "Edit address" : "Add a new address"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Form
              formControls={addressFormControls}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId ? "Save changes" : "Add"}
              onSubmit={manageAddress}
              isBtnDisabled={!isFormValid()}
            />
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default Address;
