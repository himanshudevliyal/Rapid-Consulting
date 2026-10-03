import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-100/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
