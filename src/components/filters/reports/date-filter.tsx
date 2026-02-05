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

  let limit = searchParams.get("limit");
  !limit && (limit = "10");

  let page = searchParams.get("page");
  !page || (parseInt(page.toString()) <= 1 && (page = "1"));

  const handleDateChange = (value: string) => {
    params.set("date", value);
    replace(`${pathname}?${params.toString()}`);
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
