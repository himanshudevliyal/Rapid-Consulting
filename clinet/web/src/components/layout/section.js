import { cn } from "@/lib/utils";


export default function Section({
  children,
  className,
  containerClassName,
  as: Component = "section",
  id,
}) {
  return (
    <Component
      id={id}
      className={cn("py-16", className)}
    >
      <div
        className={cn(
          "container mx-auto max-w-7xl px-4",
          containerClassName
        )}
      >
        {children}
      </div>
    </Component>
  );
}