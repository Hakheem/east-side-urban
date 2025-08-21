import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { mergeCarts, fetchCartItems } from "@/store/shop/cartSlice";
import { useToast } from "@/hooks/use-toast";
import { loginUser } from "../../store/auth/auth";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignIn = ({ disabled }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast: uiToast } = useToast();

  const onSuccess = async (credentialResponse) => {
    try {
      console.log("Google Sign-In Success:", credentialResponse);

      // Send credential to backend
      const response = await fetch(
        `${import.meta.env.VITE_URL_API}/api/auth/google`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential: credentialResponse.credential }),
        }
      );

      const data = await response.json();
      console.log("Backend response:", data);

      if (data.success) {
        // ✅ Update Redux auth state
        await dispatch(
          loginUser.fulfilled(
            {
              success: true,
              user: data.user,
              tokenInMemory: data.token,
            },
            ""
          )
        );

        // Store user for persistence (optional)
        localStorage.setItem("user", JSON.stringify(data.user));

        try {
          // Merge guest cart after successful login
          await dispatch(mergeCarts()).unwrap();
          await dispatch(fetchCartItems()).unwrap();
        } catch (cartError) {
          console.log("Cart merge error (non-critical):", cartError);
        }

        // Success toast
        uiToast({
          title: "Login Successful",
          description: `Welcome ${data.user.userName}!`,
          variant: "success",
        });

        // Navigate after short delay
        setTimeout(() => {
          const redirectPath =
            data.user.role === "admin" ? "/admin/dashboard" : "/home";
          navigate(redirectPath);
        }, 1000);
      } else {
        uiToast({
          title: "Login Failed",
          description: data.message || "Google authentication failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google auth error:", error);
      uiToast({
        title: "Authentication Error",
        description: "Failed to authenticate with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onFailure = (error) => {
    console.error("Google Sign-In Failed:", error);
    uiToast({
      title: "Authentication Failed",
      description: "Google sign-in failed. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="w-full">
      <GoogleOAuthProvider clientId={clientId}>
        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login Button */}
        <div className="w-full">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={onFailure}
            useOneTap={false}
            auto_select={false}
            size="large"
            width="100%"
            text="signin_with"
            theme="outline"
            shape="rectangular"
            disabled={disabled}
          />
        </div>
      </GoogleOAuthProvider>
    </div>
  );
};

export default GoogleSignIn;
