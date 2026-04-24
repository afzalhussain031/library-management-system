import React from "react";

import { Link, useLocation } from "react-router-dom";

import { BookOpenIcon, HeadsetIcon, InfoIcon, MenuIcon, PanelsTopLeftIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";

import { Button } from "../ui/button";

import { cn } from "../../utils/cn";

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
        className="absolute inset-0 left-auto -z-1 hidden md:block border border-sidebar-border rounded-3xl bg-sidebar text-sidebar-foreground"
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
      <div className="mt-6 mb-8 flex overflow-y-auto">
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
            <Button
              className="mx-auto w-12 h-12 flex"
              variant={label === activeLabel ? "secondary" : "ghost"}
              size="icon"
              asChild={true}
            >
              <Link to={`/dashboard/${label}`}>
                <Icon />
              </Link>
            </Button>
          </LeftSide>

          <RightSide>
            <Button
              className={cn(
                "mx-auto w-full h-12 border-0 border-r-4 rounded-none capitalize",
                label === activeLabel && "border-r-sidebar-primary"
              )}
              variant={label === activeLabel ? "default" : "ghost"}
              size="icon"
              asChild={true}
            >
              <Link to={`/dashboard/${label}`}>{label}</Link>
            </Button>
          </RightSide>
        </div >
      ))
      }
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
    <div
      className="hidden md:block"
      style={rightBarStyle}
    >
      {children}
    </div>
  );
}
