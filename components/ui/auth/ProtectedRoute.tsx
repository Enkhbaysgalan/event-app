// components/auth/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only this role can access. Omit to allow any logged-in user. */
  requiredRole?: UserRole;
  /** Where to redirect unauthenticated users. Defaults to /login */
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      // Redirect to their own home based on role
      router.replace(user.role === "organizer" ? "/dashboard" : "/explore");
    }
  }, [user, loading, requiredRole, redirectTo, router]);

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in or wrong role — render nothing (redirect in progress)
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
