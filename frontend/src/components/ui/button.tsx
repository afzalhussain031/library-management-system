import { type HTMLAttributes } from "react";

import { cn } from "../../utils/cn";

import { BASE_VARIANT, VARIANTS, SIZES, type Variant, type Size } from "../../constants/ui/button";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  variant?: Variant | undefined;
  size?: Size | undefined;
}) {
  return (
    <button
      className={cn(BASE_VARIANT, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}
