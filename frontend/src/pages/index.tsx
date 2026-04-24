import { type HTMLAttributes } from "react";

import { Link } from "react-router-dom";

import { cn } from "../utils/cn";
import { Button } from "../components/ui/button";

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
        <Button
          variant="outline"
          size="lg"
          asChild={true}
        >
          <Link to="/login">Sign In</Link>
        </Button>

        <Button
          size="lg"
          asChild={true}
        >
          <Link to="/register">Register</Link>
        </Button>
      </div>
    </main>
  );
}
