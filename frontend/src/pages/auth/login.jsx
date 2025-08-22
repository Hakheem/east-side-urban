import React, { useState, useEffect } from "react";
import { loginFormControl } from "../../config/config";
import { Link, useNavigate } from "react-router-dom";
import Form from "../../components/common/Form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/auth/auth";
import { useToast } from "@/hooks/use-toast";
import { mergeCarts, fetchCartItems } from "@/store/shop/cartSlice";
import { Loader2 } from "lucide-react";
import GoogleSignIn from "@/components/logins/GoogleSignIn";

const initialState = {
  email: "",
  password: "",
};

const AuthLogin = () => {
  const [formData, setFormData] = useState(initialState);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state) => state.auth
  );

  const { toast } = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log("[AuthLogin] Starting login process...");
      
      // 1. Log in first
      const loginResult = await dispatch(loginUser(formData)).unwrap();
      console.log("[AuthLogin] Login successful:", loginResult);

      // 2. Show login success message
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "success",
      });

      // 3. Attempt to merge carts (non-blocking)
      try {
        console.log("[AuthLogin] Starting cart merge...");
        const mergeResult = await dispatch(mergeCarts()).unwrap();
        console.log("[AuthLogin] Merge result:", mergeResult);
        
        if (mergeResult.mergeStats && mergeResult.mergeStats.merged > 0) {
          toast({
            title: "Cart Merged",
            description: `${mergeResult.mergeStats.merged} item(s) from your guest cart have been added!`,
            variant: "success",
          });
        }
      } catch (mergeError) {
        console.error("[AuthLogin] Cart merge failed:", mergeError);
        // Don't block login for merge failures
        toast({
          title: "Cart Merge Issue",
          description: "Your items may not have been merged. Please check your cart.",
          variant: "warning",
        });
      }

      // 4. Always fetch the final cart state
      try {
        await dispatch(fetchCartItems()).unwrap();
        console.log("[AuthLogin] Cart items fetched successfully");
      } catch (fetchError) {
        console.error("[AuthLogin] Failed to fetch cart items:", fetchError);
      }

      // 5. Navigate based on user role
      const targetRoute = loginResult.user?.role === "admin" ? "/admin/dashboard" : "/home";
      console.log("[AuthLogin] Navigating to:", targetRoute);
      navigate(targetRoute);

    } catch (loginError) {
      console.error("[AuthLogin] Login error:", loginError);
      // The error toast will be handled by the useEffect hook below
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement actual forgot password API call
    toast({
      title: "Password Reset Email Sent",
      description: `If an account exists for ${forgotPasswordEmail}, you will receive an email with instructions.`,
      variant: "success",
    });

    setShowForgotPassword(false);
    setForgotPasswordEmail("");
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

      {!showForgotPassword ? (
        <>
          <Form
            formControls={loginFormControl}
            buttonText={
              isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )
            }
            formData={formData}
            setFormData={setFormData}
            onSubmit={onSubmit}
            disabled={isLoading}
            middleContent={
              <div className="text-right">
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </button>
              </div>
            }
          />

          {/* Google Sign-In placed here - after the form */}
          <GoogleSignIn disabled={isLoading} />
        </>
      ) : (
        <div className="space-y-4 p-6 border rounded-lg">
          <h2 className="text-xl font-bold text-center">Reset Password</h2>
          <p className="text-sm text-center text-gray-600">
            Enter your email to receive a password reset link
          </p>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-medium mb-1"
              >
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                placeholder="your@email.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                }}
                className="w-full border py-2 px-4 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthLogin;
