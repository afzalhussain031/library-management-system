import { type HTMLAttributes } from "react";

import { Link } from "react-router-dom";

import { cn } from "../utils/cn";

import { BASE_VARIANT, VARIANTS, SIZES } from "../constants/ui/button";

export default function Page({ className }: HTMLAttributes<HTMLDivElement>) {
  return (
    <main className={cn(
      "p-4 flex flex-col justify-center items-center",
      "space-y-8 text-center",
      className
    )}>
      <h1 className="text-3xl font-bold">📚 Welcome to Library Management System</h1>
      <p>Manage your university library efficiently</p>

      <div className="space-x-4">
        <Link
          className={cn(BASE_VARIANT, VARIANTS.outline, SIZES.lg)}
          to="/login"
        >Sign In</Link>

        <Link
          className={cn(BASE_VARIANT, VARIANTS.default, SIZES.lg)}
          to="/register"
        >Register</Link>
      </div>
    </main>
  );
}
