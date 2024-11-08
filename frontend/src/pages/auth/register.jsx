import { registerFormControl } from "../../config/config";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "../../components/common/Form";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/auth/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, isAuthenticated } = useSelector((state) => state.auth);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await dispatch(registerUser(formData));

      if (data?.payload?.message === "Registration successful") {
        setFormData(initialState);
        toast.success("Registration successful!");
        navigate("/auth/login");
      }

      if (data?.payload?.message === "User already exists") {
        toast.error("User already exists");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  if (error) {
    toast.error(error);
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create a new account
        </h1> 
        <p className="mt-2">
          Already have an account?
          <Link
            className="font-medium text-primary ml-2 hover:underline"
            to="/auth/login"
          >
            Login
          </Link>
        </p>
      </div>
      <Form
        formControls={registerFormControl}
        buttonText={"Create Account"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default Register;
