import { Link } from "react-router-dom";

import { cn } from "../utils/cn";

export function Navbar() {
  return (
    <nav className={cn(
      "h-16 border-b",
      "flex justify-center items-center",
      "text-4xl font-bold"
    )}>
      <Link to="/">LMS</Link>
    </nav>
  );
}
