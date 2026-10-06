import { cn } from "@/lib/utils";

// A titled box used to group the fields of an add / edit form.
export function FormCard({ title, description, children, className }) {
  return (
    <section className={cn("space-y-4 rounded-xl border bg-card p-5 shadow-sm", className)}>
      {(title || description) && (
        <div className="space-y-0.5">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

// Main content on the left, status / image / category on the right. On a
// narrow screen the side column moves below the main one.
export function FormColumns({ main, side }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="min-w-0 space-y-6">{main}</div>
      <div className="min-w-0 space-y-6">{side}</div>
    </div>
  );
}

export function FieldError({ error }) {
  return error ? <p className="text-sm text-red-500">{error.message}</p> : null;
}
