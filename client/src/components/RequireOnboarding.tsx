import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchWithAuth } from "../lib/api";

export const RequireOnboarding = () => {
  const { getToken } = useAuth();

  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => fetchWithAuth("/user/profile", getToken),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If age is missing, assume they haven't completed onboarding
  if (user && !user.age) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
