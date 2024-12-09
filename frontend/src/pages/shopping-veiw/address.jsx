import Form from "@/components/common/Form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addressFormControls } from "@/config/config";
import React, { useState } from "react";

const initialAddressFormData = {
  address: "",
  city: "",
  zipcode: "",
  phone: "",
  notes: "",
};
const Address = () => {
  const [formData, setFormData] = useState(initialAddressFormData);

  function manageAddress(e) {
    e.preventDefault();
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key].trim() !== "")
      .every((item) => item);
  }

  return (
    <Card>
      <div className="px-6 mt-4 "> Address List </div>
      <CardHeader>
        <CardTitle>Add a new address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Form
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={"Add"}
          onSubmit={manageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
};

export default Address;
