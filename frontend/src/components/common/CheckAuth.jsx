import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const CheckAuth = ({ isAuthenticated, children, user }) => {
  const location = useLocation();

  if (
    !isAuthenticated &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    )
  ) {
    return <Navigate to="/auth/login" />;
  }

  if (isAuthenticated) {
    if (
      location.pathname.includes("/login") ||
      location.pathname.includes("/register")
    ) {
      if (user?.role === "admin") {
        return <Navigate to="/admin/dashboard" />;
      } else {
        return <Navigate to="/home" />;
      }
    }

    if (user?.role !== "admin" && location.pathname.includes("/admin")) {
      return <Navigate to="/unauthorised" />;
    }

    if (user?.role === "admin" && location.pathname.includes("/home")) {
      return <Navigate to="/admin/dashboard" />;
    }
  }

  return children;
};

export default CheckAuth;
