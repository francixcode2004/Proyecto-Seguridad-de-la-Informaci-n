import { Navigate } from "react-router-dom";
import { isAdmin, isAuthenticated } from "../../utils/auth";

export default function ProtectedRoute({ children, adminOnly = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/user" replace />;
  }

  return children;
}