import React from "react";

import { Link, useLocation } from "react-router-dom";

import { BookOpenIcon, HeadsetIcon, InfoIcon, MenuIcon, PanelsTopLeftIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";

import { Button } from "../ui/button";

import { cn } from "../../utils/cn";

import { BASE_VARIANT, SIZES, VARIANTS } from "../../constants/ui/button";

export function Sidebar({ className }: React.ComponentProps<"aside">) {
  return (
    <aside
      className={cn("w-min h-full inline-block", className)}
      style={{
        "--left-bar-width": "4rem",
        "--right-bar-width": "12rem",
        "--right-bar-margin-left": "0.5rem",
      } as React.CSSProperties}
    >
      {/* Left Bar Background */}
      <div
        className="absolute inset-0 right-auto -z-1 border border-sidebar-border rounded-full bg-sidebar-accent text-sidebar-foreground"
        style={leftBarStyle}
      />

      {/* Right Bar Background */}
      <div
        className="absolute inset-0 left-auto -z-1 border border-sidebar-border rounded-3xl bg-sidebar text-sidebar-foreground"
        style={rightBarStyle}
      />

      <SidebarContent />
    </aside>
  );
}

const navLinks = [
  { label: "overview", icon: PanelsTopLeftIcon },
  { label: "books", icon: BookOpenIcon },
  { label: "wishlist", icon: UsersRoundIcon },
  { label: "settings", icon: SettingsIcon },
  { label: "about", icon: InfoIcon },
  { label: "support", icon: HeadsetIcon }
];

function SidebarContent() {
  const location = useLocation();
  const paths = location.pathname.split("/");
  const activeLabel = paths[paths.length - 1];

  return (
    <>
      <div className="mt-6 mb-8 flex">
        <LeftSide>
          <div className="flex justify-center">
            <MenuIcon />
          </div>
        </LeftSide>

        <RightSide>
          <div className="px-4 flex flex-col text-center">
            <span>LMS</span>
            <Button>LEND / RETURN</Button>
          </div>
        </RightSide>
      </div>

      {navLinks.map(({ label, icon: Icon }) => (
        <div key={label} className="flex">
          <LeftSide>
            <Link
              className={cn(
                BASE_VARIANT,
                label === activeLabel ? VARIANTS.secondary : VARIANTS.ghost,
                SIZES.icon,
                "h-12 w-12 mx-auto flex"
              )}
              to={`/dashboard/${label}`}
            >
              <Icon />
            </Link>
          </LeftSide>

          <RightSide>
            <Link
              className={cn(
                BASE_VARIANT,
                label === activeLabel ? VARIANTS.default : VARIANTS.ghost,
                SIZES.default,
                "mx-auto h-12 border-0 border-r-4 rounded-none flex capitalize",
                label === activeLabel && "border-r-sidebar-primary"
              )}
              to={`/dashboard/${label}`}
            >{label}</Link>
          </RightSide>
        </div>
      ))}
    </>
  );
}

const leftBarStyle: React.CSSProperties = {
  width: "var(--left-bar-width)"
};

function LeftSide({ children }: { children: React.ReactNode; }) {
  return (
    <div style={leftBarStyle}>
      {children}
    </div>
  );
}

const rightBarStyle: React.CSSProperties = {
  marginLeft: "var(--right-bar-margin-left)",
  width: "var(--right-bar-width)"
};

function RightSide({ children }: { children: React.ReactNode; }) {
  return (
    <div style={rightBarStyle}>
      {children}
    </div>
  );
}
