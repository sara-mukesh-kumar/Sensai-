"use client";

import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DatePickerComponent = forwardRef(
  ({ className, dateFormat = "MM/yyyy", showMonthYearPicker, ...props }, ref) => {
    return (
      <div className="relative">
        <DatePicker
          {...props}
          dateFormat={dateFormat}
          showMonthYearPicker={showMonthYearPicker}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          wrapperClassName="w-full"
          calendarClassName="bg-background border border-border rounded-md shadow-lg"
          popperClassName="z-50"
          ref={ref}
        />
        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
);

DatePickerComponent.displayName = "DatePicker";

export { DatePickerComponent };