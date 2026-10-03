"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

export function DateTimePickerForm({
  onChange,
  value,
  disabled,
  minDate = new Date(),
  maxDate,
  minutesGap = 5,
}) {
  const [open, setOpen] = useState(false);

  const handleTimeChange = (hour, minute) => {
    const currentDate = value ? new Date(value) : new Date();
    const newDate = new Date(currentDate);

    if (hour !== undefined) newDate.setHours(hour);
    if (minute !== undefined) newDate.setMinutes(minute);

    onChange(newDate);
  };

  const selectedDate = value ? new Date(value) : null;
  const today = new Date();
  const isToday =
    selectedDate &&
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  // Available hours
  const availableHours = Array.from({ length: 24 }, (_, i) => i).filter(
    (hour) => {
      if (!selectedDate) return true;
      if (!isToday) return true;

      if (hour > today.getHours()) return true;

      if (hour === today.getHours()) {
        return today.getMinutes() + minutesGap < 60;
      }

      // All past hours not allowed
      return false;
    },
  );

  // Available minutes: only allow minutes at least 5 min in future for current hour
  const availableMinutes = Array.from({ length: 60 }, (_, i) => i).filter(
    (minute) => {
      if (!selectedDate || !isToday) return true;

      if (selectedDate.getHours() > today.getHours()) return true;

      if (selectedDate.getHours() === today.getHours()) {
        return minute >= today.getMinutes() + minutesGap;
      }

      return false;
    },
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full pl-3 text-left font-normal",
            !value && "text-muted-foreground",
          )}
          disabled={disabled}
        >
          {value ? (
            format(value, "MM/dd/yyyy HH:mm")
          ) : (
            <span>MM/DD/YYYY HH:mm</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          {/* Calendar */}
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => onChange(date)}
            initialFocus
            disabled={{
              before: minDate,
              after: maxDate,
            }}
          />

          {selectedDate && (
            <div className="flex flex-col divide-y sm:h-75 sm:flex-row sm:divide-x sm:divide-y-0">
              {/* Hours */}
              <ScrollArea className="w-32 sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {availableHours.map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        selectedDate.getHours() === hour ? "default" : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() =>
                        handleTimeChange(hour, selectedDate.getMinutes())
                      }
                    >
                      {hour.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              {/* Minutes */}
              <ScrollArea className="w-32 sm:w-auto">
                <div className="flex p-2 sm:flex-col">
                  {availableMinutes.map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        selectedDate.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="aspect-square shrink-0 sm:w-full"
                      onClick={() =>
                        handleTimeChange(selectedDate.getHours(), minute)
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
