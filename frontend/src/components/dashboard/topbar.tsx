import React from "react";

import { Input } from "../ui/input";

import { cn } from "../../utils/cn";

import { useAuth } from "../../hooks";

export function Topbar({ className }: React.ComponentProps<"div">) {
  return (
    <div className={cn("border rounded-full bg-background p-3 grid grid-cols-2", className)}>
      <SearchBar />
      <UserProfileIcon />
    </div>
  );
}

function SearchBar() {
  return (
    <Input
      className="rounded-full"
      placeholder="Search"
    />
  );
}

function UserProfileIcon() {
  const { user } = useAuth();

  return (
    <span className="ml-auto w-8 h-8 border rounded-full bg-secondary text-secondary-foreground inline-flex justify-center items-center">
      {user?.email?.charAt(0).toUpperCase()}
    </span>
  );
}
