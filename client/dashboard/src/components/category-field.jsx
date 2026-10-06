"use client";
import Link from "next/link";
import CommandMenu from "@/components/command-menu";
import { useFormattedCategories } from "@/hooks/use-categories";

// Searchable category picker: shows the category name, gives back its id
// ("" when cleared).
export default function CategoryField({ value, onChange, hasError }) {
  const { data, isLoading, isError, error } = useFormattedCategories("");

  return (
    <div className="space-y-1">
      <CommandMenu
        data={data ?? []}
        value={value || ""}
        onChange={(val) => onChange(val ?? "")}
        searchPlaceholder="Search category"
        emptyMessage="No category found."
        isLoading={isLoading}
        isError={isError}
        error={error}
        className={hasError ? "border-red-500" : ""}
      />
      <p className="text-xs text-muted-foreground">
        Optional. <Link className="underline" href="/categories">Manage categories</Link>
      </p>
    </div>
  );
}
