"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormattedCategories } from "@/hooks/use-categories";
import { useFormattedSubCategories } from "@/hooks/use-sub-categories";


export default function CategoryFilter({ placeholder = "Select Category" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: categories = [], isLoading } = useFormattedCategories();

  // Backend reads this as `category` (singular)
  const selectedCategory = searchParams.get("category") || "all";

  const handleChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    // Pagination reset
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-2">
      <Label>Category</Label>

      <Select
        value={selectedCategory}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>

          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


export function SubCategoryFilter({
  placeholder = "Select Sub Category",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: subCategories = [], isLoading } =
    useFormattedSubCategories();

  // Backend reads this as `sub_category` (underscore, not hyphen)
  const selectedSubCategory =
    searchParams.get("sub_category") || "all";

  const handleChange = (value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("sub_category");
    } else {
      params.set("sub_category", value);
    }

    // Pagination reset
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full space-y-2">
      <Label>Sub Category</Label>

      <Select
        value={selectedSubCategory}
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Sub Categories
          </SelectItem>

          {subCategories.map((subCategory) => (
            <SelectItem
              key={subCategory.value}
              value={subCategory.value}
            >
              {subCategory.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}