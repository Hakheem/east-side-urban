import { loginFormControl } from "../../config/config";
import React, { useState } from "react";
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

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields before logging in.");
      return;
    }

    try {
      const response = await dispatch(loginUser(formData)).unwrap();

      if (response?.message === "Logged in successfully." && response?.user) {
        setFormData(initialState); 
        toast.success("Login successful!");
        navigate("/home"); 
      } 
      
      else {
        
        if (response?.message === "User doesn't exist. Kindly register then try again") {
          toast.error("Email not found! Please check your email address.");
        } 
        
        else if (response?.message === "Password is incorrect") {
          toast.error("Incorrect password! Please check your password.");
        } 
        
        else {
          toast.error("Login failed! Please check your credentials.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
    }
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
