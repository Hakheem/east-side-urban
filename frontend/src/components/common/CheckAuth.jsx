import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const CheckAuth = ({ children, roles = [], guestAllowed = false }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // guest access
  if (!isAuthenticated) {
    return guestAllowed ? (
      children
    ) : (
      <Navigate to="/auth/login" state={{ from: location }} replace />
    );
  }

  if (isAuthenticated && location.pathname.startsWith("/auth")) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/dashboard" : "/home"}
        replace
      />
    );
  }

  if (location.pathname.startsWith("/admin") && user?.role !== "admin") {
    return <Navigate to="/unauthorised" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorised" replace />;
  }

  return children;
};
 
export default CheckAuth;
