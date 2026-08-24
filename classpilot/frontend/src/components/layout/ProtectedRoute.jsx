import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../ui/Loader";

export default function ProtectedRoute({ children }) {
  const { teacher, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader label="Loading ClassPilot..." />
      </div>
    );
  }

  if (!teacher) return <Navigate to="/login" replace />;

  return children;
}
