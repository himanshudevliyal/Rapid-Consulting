import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorMessage from "@/components/ui/error";

export default function CommandMenu({
  data,
  value,
  onChange,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  className = "",
  disabled,
  isLoading,
  isError,
  error,
}) {
  const [open, setOpen] = useState(false);

  if (isError) return <ErrorMessage isTitle={false} error={error} />;

  return isLoading ? (
    <Skeleton className={"h-9 w-full"} />
  ) : (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "h-10 w-full justify-between",
            !value && "text-muted-foreground",
            className,
          )}
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : "Select an option"}
          <div className="rel flex gap-1">
            <ChevronsUpDown className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {value && (
              <CommandGroup>
                <CommandItem
                  value="clear"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  Clear selection
                  <X className="ml-auto" />
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {data?.map((item) => (
                <CommandItem
                  value={item.label}
                  key={item.value}
                  onSelect={() => {
                    if (onChange) {
                      onChange(item.value);
                    }
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": item.value === value,
                    })}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
