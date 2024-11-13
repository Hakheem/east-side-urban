import React, { useState } from "react";
import { loginFormControl } from "../../config/config";
import { Link, useNavigate } from "react-router-dom";
import Form from "../../components/common/Form";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/auth/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialState = {
  email: "",
  password: "",
};

const AuthLogin = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
  
    dispatch(loginUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast.success("Login successful!");
        navigate("/home");
      } else {
        toast.error(data?.payload?.message || "An unknown error occurred.");
      }
    }).catch((error) => {
      toast.error(error.response?.data?.message || "An error occurred during login.");
    });
  }
  

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign in to your account
        </h1>
        <p className="mt-2">
          Don't have an account?
          <Link
            className="font-medium text-primary ml-2 hover:underline"
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

export default AuthLogin;
