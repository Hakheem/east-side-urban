import { registerFormControl } from "../../config/config";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Form from "../../components/common/Form";
import { useDispatch } from "react-redux";
import { registerUser } from "../../store/auth/auth";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

const Register = () => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    dispatch(registerUser(formData))
      .then((result) => {
        setIsLoading(false);

        if (result.payload?.success) {
          navigate("/auth/login");
          toast({
            title: "🎉 Registration Successful",
            description: "Your account has been created!",
            type: "success",
          });
        } else if (result.payload?.message === "User already exists") {
          toast({
            title: "🚫 Registration Failed",
            description:
              "User already exists. Please use a different email or login",
            type: "info",
          });
        } else {
          toast({
            title: "🚫 Registration Failed",
            description:
              result.payload?.message ||
              "Please check your information and try again.",
            type: "error",
          });
        }
      })
      .catch((error) => {
        setIsLoading(false);
        toast({
          title: "🚫 Registration Error",
          description: error.message || "An unexpected error occurred",
          type: "error",
        });
      });
  };

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
        buttonText={isLoading ? "Creating Account..." : "Create Account"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        disabled={isLoading}
        middleContent={
          <div className="text-sm text-gray-600 mt-2">
            <p>Password must contain:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li
                className={
                  formData.password.length >= 6 ? "text-green-500" : ""
                }
              >
                At least 6 characters
              </li>
              <li
                className={
                  /[A-Z]/.test(formData.password) ? "text-green-500" : ""
                }
              >
                At least one uppercase letter
              </li>
              <li
                className={
                  /[a-z]/.test(formData.password) ? "text-green-500" : ""
                }
              >
                At least one lowercase letter
              </li>
              <li
                className={/\d/.test(formData.password) ? "text-green-500" : ""}
              >
                At least one number
              </li>
              <li
                className={
                  /[!@#$%^&*]/.test(formData.password) ? "text-green-500" : ""
                }
              >
                At least one special character
              </li>
            </ul>
          </div>
        }
      />
    </div>
  );
};

export default Register;
