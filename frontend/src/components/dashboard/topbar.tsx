import React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
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
      className="h-10 rounded-full"
      placeholder="Search"
    />
  );
}

function UserProfileIcon() {
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={true}>
        <Button
          className="ml-auto w-10 h-10 rounded-full text-lg uppercase"
          variant="outline"
          size="icon"
        >
          {user?.email?.charAt(0)}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <LogoutButton />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LogoutButton() {
  const auth = useAuth();

  return (
    <DropdownMenuItem onClick={() => { auth.logout(); }}>
      Logout
    </DropdownMenuItem>
  );
}
