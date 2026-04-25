import React from "react";

import { Navigate } from "react-router-dom";

import { cn } from "../utils/cn";

import { useAuth } from "../hooks";

export function SignWrapper({ children }: { children: React.ReactNode; }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-svh p-4 grid md:grid-cols-2 gap-4 bg-linear-30 from-primary to-secondary">
      <SideCard className="sticky top-4 hidden md:flex" />
      {children}
    </main>
  );
}

export function SideCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "h-[90svh] rounded-2xl p-4",
        "bg-linear-150 from-primary to-secondary",
        "flex flex-col justify-around items-center",
        "text-center text-primary-foreground",
        className
      )}
      {...props}
    >
      <h1 className="text-4xl">Create. Borrow. Learn</h1>
      <p className="text-sm">Access thousands of academic resources with a streamlined digital platform designed for students and faculty.</p>
    </div>
  );
}
