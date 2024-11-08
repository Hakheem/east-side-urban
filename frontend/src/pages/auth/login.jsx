import { loginFormControl } from "../../config/config";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Form from "../../components/common/Form";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/auth/auth";
import { toast } from "react-toastify"; // Import toast for notifications
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

const initialState = {
  email: "",
  password: "",
};


const authLogin = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();

  function onSubmit(e) {
    e.preventDefault();  // Prevent the default form submission
    console.log("Form submitted", formData);  // Log the form data

    // Dispatch the login action
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        // Reset the form after successful login
        setFormData(initialState);
        toast.success("Login successful!");
      } else {
        // Handle error scenarios with specific messages
        if (data?.payload?.message === "Email not found") {
          toast.error("Email not found! Please check your email address.");
        } else if (data?.payload?.message === "Incorrect password") {
          toast.error("Incorrect password! Confirm password and try again.");
        } else {
          toast.error("Login failed! Please check your credentials.");
        }
      }
    }).catch((error) => {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 ">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground ">
          Sign in to your account
        </h1>
        <p className="mt-2 ">
          Don't have an account?
          <Link
            className="font-medium text-primary ml-2 hover:underline "
            to="/auth/register"
          >
            Create an account
          </Link>
        </p>
      </div>
      <Form
        formControls={loginFormControl}
        buttonText={"Login"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default authLogin;
