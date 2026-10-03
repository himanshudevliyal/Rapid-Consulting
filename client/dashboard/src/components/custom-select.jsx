import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CustomSelect = ({
  value,
  onChange,
  options,
  errors,
  placeholder = "Select",
  className = "",
}) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger
        size="lg"
        className={cn("w-full", className, {
          "border-red-500": errors?.color,
        })}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((color) => (
          <SelectItem
            key={color.value}
            value={color.value}
            className="capitalize"
          >
            {color.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
