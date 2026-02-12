"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORTS_DATE } from "@/constants";

export const DateFilter = () => {
  const pathname = usePathname();
  const { replace } = useRouter();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);


const handleDateChange = (value: string) => {
  const newParams = new URLSearchParams(searchParams.toString());

  newParams.set("date", value);
  newParams.set("page", "1"); // reset pagination

  replace(`${pathname}?${newParams.toString()}`);
};

  return (
    <Select
      value={searchParams.get("date") || "all"}
      onValueChange={handleDateChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {REPORTS_DATE.map((item, index: number) => (
          <SelectItem key={index} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
