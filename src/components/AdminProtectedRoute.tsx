import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, roles, loading } = useAuth();
  if (loading) return null;
  if (!session || !roles.includes("admin")) return <Navigate to="/mgmt" replace />;
  return <>{children}</>;
};

export default AdminProtectedRoute;
