"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "iconsax-react";
import { DateRange as DateRangeType } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DateRange = () => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const [date, setDate] = React.useState<DateRangeType | undefined>();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  let limit = searchParams.get("limit");
  !limit && (limit = "10");

  let page = searchParams.get("page");
  !page || (parseInt(page.toString()) <= 1 && (page = "1"));

  const handleChangeDate = (dates: DateRangeType | undefined) => {
    setDate(dates);

    const fromDate = dates?.from?.toISOString().split("T")[0];
    const toDate = dates?.to?.toISOString().split("T")[0];

    fromDate && params.set("fromDate", fromDate?.toString() as string);
    toDate && params.set("toDate", toDate?.toString() as string);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid gap-2 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "bg-gray-100 rounded-full flex items-center gap-2 min-w-full sm:min-w-[280px] h-12 px-4 sm:px-5 text-sm sm:text-base",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4 shrink-0" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="truncate">
                    {format(date.from, isMobile ? "dd/MM" : "LLL dd, y")} -{" "}
                    {format(date.to, isMobile ? "dd/MM" : "LLL dd, y")}
                  </span>
                </>
              ) : (
                <span className="truncate">
                  {format(date.from, isMobile ? "dd/MM/yy" : "LLL dd, y")}
                </span>
              )
            ) : (
              <span className="text-black/50 truncate">Pick a date</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align={isMobile ? "center" : "start"}
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleChangeDate}
            numberOfMonths={isMobile ? 1 : 2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRange;