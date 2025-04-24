import { Navigate, useLocation } from "react-router-dom";

const CheckAuth = ({ isAuthenticated, user, children }) => {
  const location = useLocation();

  console.log("CheckAuth location:", location.pathname);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);

  if (!isAuthenticated) {
    console.log("Redirecting guest to login...");
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (user?.role === "admin" && !location.pathname.startsWith("/admin")) {
    console.log("Admin detected. Redirecting to /admin/dashboard...");
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (location.pathname.startsWith("/admin") && user?.role !== "admin") {
    console.log(
      "Non-admin trying to access admin route. Redirecting to /unauthorised..."
    );
    return <Navigate to="/unauthorised" replace />;
  }

  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/register"))
  ) {
    console.log(
      "Authenticated user trying to access login/register. Redirecting..."
    );
    return user?.role === "admin" ? (
      <Navigate to="/admin/dashboard" replace />
    ) : (
      <Navigate to="/home" replace />
    );
  }

  console.log("Authorized. Rendering children.");
  return children;
};

export default CheckAuth;
